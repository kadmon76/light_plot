# designer/controllers/plot_controller.py
import json
import logging
from django.core.cache import cache
from django.contrib.auth.models import User
from .base_controller import BaseController
from ..models import LightingPlot, PlotFixture, Stage, LightFixture

logger = logging.getLogger(__name__)

class PlotController(BaseController):
    """
    Controller for managing lighting plots.
    
    This controller handles operations related to lighting plots, including
    retrieving plots, creating new plots, updating existing plots, and 
    managing the fixtures within plots.
    """
    
    def __init__(self, cache_timeout=300):  # Cache plots for 5 minutes by default
        """
        Initialize the plot controller
        
        Args:
            cache_timeout (int): Cache timeout in seconds
        """
        super().__init__(LightingPlot, cache_timeout)
        
    def get_plots_for_user(self, user):
        """
        Retrieve all lighting plots for a specific user.
        
        Args:
            user (User): The user whose plots to retrieve.
            
        Returns:
            QuerySet: All LightingPlot objects for the user.
        """
        return LightingPlot.objects.filter(user=user)
    
    def get_plot_by_id(self, plot_id, user=None, use_cache=True):
        """
        Retrieve a specific lighting plot by ID.
        
        Args:
            plot_id (int): ID of the plot to retrieve.
            user (User, optional): If provided, ensure the plot belongs to this user.
            use_cache (bool): Whether to use cache (default: True)
            
        Returns:
            LightingPlot: The requested plot or None if not found.
        """
        if not user:
            # Use base controller method if no user is provided
            return self.get_by_id(plot_id, use_cache)
            
        try:
            # Try to get from cache first
            if use_cache:
                cache_key = f"plot_id_{plot_id}_user_{user.id}"
                cached_plot = cache.get(cache_key)
                if cached_plot:
                    return cached_plot
                    
            # Get from database if not in cache
            plot = LightingPlot.objects.get(id=plot_id, user=user)
            
            # Set in cache
            if use_cache:
                cache_key = f"plot_id_{plot_id}_user_{user.id}"
                cache.set(cache_key, plot, self.cache_timeout)
                
            return plot
        except LightingPlot.DoesNotExist:
            return None
        except Exception as e:
            logger.error(f"Error retrieving plot with ID {plot_id} for user {user}: {e}")
            return None
    
    def create_or_update_plot(self, plot_data, user):
        """
        Create a new lighting plot or update an existing one.
        
        Args:
            plot_data (dict): Data for the plot, including:
                - title: Plot title
                - stage_id: ID of the stage
                - show_name: Name of the show (optional)
                - venue: Venue name (optional)
                - designer: Designer name (optional)
                - date: Show date (optional)
                - plot_data: JSON data for the plot
                - fixtures: List of fixture data
            user (User): The user creating/updating the plot.
            
        Returns:
            tuple: (LightingPlot, bool) - The plot and whether it was created
        """
        plot_id = plot_data.get('plot_id')
        created = False
        
        if plot_id:
            # Update existing plot
            plot = self.get_plot_by_id(plot_id, user)
            if not plot:
                return None, False
        else:
            # Create new plot
            stage = Stage.objects.get(id=plot_data['stage_id'])
            plot = LightingPlot(user=user, stage=stage)
            created = True
            
        # Update plot fields
        plot.title = plot_data.get('title', 'Untitled Plot')
        if 'show_name' in plot_data:
            plot.show_name = plot_data['show_name']
        if 'venue' in plot_data:
            plot.venue = plot_data['venue']
        if 'designer' in plot_data:
            plot.designer = plot_data['designer']
        if 'date' in plot_data:
            plot.date = plot_data['date']
        
        # Update plot data JSON
        if 'plot_data' in plot_data:
            plot.plot_data = plot_data['plot_data']
            
        plot.save()
        
        # Clear cache for this plot and user
        if user:
            cache_key = f"plot_id_{plot.id}_user_{user.id}"
            cache.delete(cache_key)
            # Also clear user plots cache
            cache.delete(f"user_plots_{user.id}")
        
        # Handle fixtures if provided
        if 'fixtures' in plot_data and plot_data['fixtures']:
            # Remove existing fixtures if updating
            if not created:
                PlotFixture.objects.filter(plot=plot).delete()
                
            # Add new fixtures
            self._add_fixtures_to_plot(plot, plot_data['fixtures'])
            
        return plot, created
    
    def _add_fixtures_to_plot(self, plot, fixtures_data):
        """
        Add fixtures to a lighting plot.
        
        Args:
            plot (LightingPlot): The plot to add fixtures to.
            fixtures_data (list): List of fixture data.
            
        Returns:
            list: The created plot fixtures.
        """
        created_fixtures = []
        
        for fixture_data in fixtures_data:
            fixture_type = LightFixture.objects.get(id=fixture_data['fixture_id'])
            
            plot_fixture = PlotFixture(
                plot=plot,
                fixture_type=fixture_type,
                x_position=fixture_data.get('x', 0),
                y_position=fixture_data.get('y', 0),
                rotation=fixture_data.get('rotation', 0),
                channel=fixture_data.get('channel'),
                dimmer=fixture_data.get('dimmer'),
                color=fixture_data.get('color', ''),
                purpose=fixture_data.get('purpose', ''),
                notes=fixture_data.get('notes', '')
            )
            plot_fixture.save()
            created_fixtures.append(plot_fixture)
            
        return created_fixtures
    
    def delete_plot(self, plot_id, user):
        """
        Delete a lighting plot.
        
        Args:
            plot_id (int): ID of the plot to delete.
            user (User): The user deleting the plot.
            
        Returns:
            bool: True if successful, False otherwise.
        """
        plot = self.get_plot_by_id(plot_id, user, use_cache=False)
        if not plot:
            return False
            
        try:
            # Delete the plot
            plot.delete()
            
            # Clear cache
            cache_key_plot = f"plot_id_{plot_id}_user_{user.id}"
            cache_key_plots = f"user_plots_{user.id}"
            cache.delete(cache_key_plot)
            cache.delete(cache_key_plots)
            
            # Also clear any editor context cache
            cache.delete(f"editor_context_user_{user.id}_plot_{plot_id}")
            cache.delete(f"plot_data_{plot_id}_user_{user.id}")
            
            return True
        except Exception as e:
            logger.error(f"Error deleting plot with ID {plot_id}: {e}")
            return False
    
    def get_plot_with_fixtures(self, plot_id, user):
        """
        Get complete plot data including fixtures.
        
        Args:
            plot_id (int): ID of the plot to retrieve
            user (User): User requesting the plot
            
        Returns:
            dict: Dictionary with plot and fixtures data or None if plot not found
        """
        try:
            plot = self.get_plot_by_id(plot_id, user)
            if not plot:
                return None
                
            fixtures = plot.fixtures.all()
            
            fixtures_data = []
            for fixture in fixtures:
                try:
                    fixtures_data.append({
                        'id': fixture.id,
                        'fixture_id': fixture.fixture_type.id,
                        'x': fixture.x_position,
                        'y': fixture.y_position,
                        'rotation': fixture.rotation,
                        'channel': fixture.channel,
                        'dimmer': fixture.dimmer,
                        'color': fixture.color,
                        'purpose': fixture.purpose,
                        'notes': fixture.notes
                    })
                except Exception as fixture_error:
                    logger.error(f"Error processing fixture {fixture.id}: {fixture_error}")
                    # Continue with next fixture
        
            result = {
                'plot': {
                    'id': plot.id,
                    'title': plot.title,
                    'stage_id': plot.stage.id,
                    'show_name': plot.show_name,
                    'venue': plot.venue,
                    'designer': plot.designer,
                    'date': plot.date.isoformat() if plot.date else None,
                    'plot_data': plot.plot_data
                },
                'fixtures': fixtures_data
            }
            
            return result
        except Exception as e:
            logger.error(f"Error retrieving plot data for plot {plot_id}: {e}")
            return None