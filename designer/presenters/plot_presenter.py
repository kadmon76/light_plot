# designer/presenters/plot_presenter.py
import logging
from django.utils.text import slugify
from .base_presenter import BasePresenter

logger = logging.getLogger(__name__)

class PlotPresenter(BasePresenter):
    """
    Presenter for lighting plot views.
    
    This presenter handles the logic for preparing plot data to be displayed
    in views and processing user input related to plots.
    """
    
    def __init__(self):
        """
        Initialize the plot presenter.
        """
        super().__init__()
        self.plot_controller = self.service_registry.get_plot_controller()
        self.fixture_controller = self.service_registry.get_fixture_controller()
        self.stage_controller = self.service_registry.get_stage_controller()
        self.template_controller = self.service_registry.get_template_controller()
    
    def get_editor_context(self, plot_id=None, user=None):
        """
        Prepare context data for the plot editor view.
        
        Args:
            plot_id (int, optional): ID of the plot to edit.
            user (User): The current user.
            
        Returns:
            dict: Context data for the editor template.
        """
        def load_editor_data():
            context = {}
            
            if plot_id:
                plot = self.plot_controller.get_plot_by_id(plot_id, user)
                if plot:
                    context['plot'] = plot
            
            # Get fixtures, templates and stages for the editor
            context['fixtures'] = self.fixture_controller.get_all_fixtures()
            context['templates'] = self.template_controller.get_all_templates()
            context['stages'] = self.stage_controller.get_all_stages()
            
            return context
        
        # Use caching for the editor data to reduce API costs
        if user and plot_id:
            cache_key = f"editor_context_user_{user.id}_plot_{plot_id}"
            return self.cache_view_data(cache_key, load_editor_data)
        else:
            # For new plots, still cache fixtures, templates, and stages
            cache_key = f"editor_new_plot_context_user_{user.id if user else 'anonymous'}"
            return self.cache_view_data(cache_key, load_editor_data)
    
    def get_user_plots_context(self, user):
        """
        Prepare context data for displaying user's plots.
        
        Args:
            user (User): The current user.
            
        Returns:
            dict: Context data with user's plots.
        """
        def load_user_plots():
            plots = self.plot_controller.get_plots_for_user(user)
            # Format the plots if needed for view display
            return {'plots': plots}
        
        # Cache user plots to reduce API costs
        cache_key = f"user_plots_{user.id}"
        return self.cache_view_data(cache_key, load_user_plots)
    
    def handle_plot_save(self, plot_data, user):
        """
        Process and validate plot data from a save request.
        
        Args:
            plot_data (dict): Plot data from the request.
            user (User): The current user.
            
        Returns:
            tuple: (success, result_data, status_code)
        """
        # Validate plot data
        required_fields = ['title']
        if not plot_data.get('plot_id'):
            required_fields.append('stage_id')
            
        field_validators = {
            'title': lambda val: True if val and len(val) <= 200 else "Title must be between 1 and 200 characters"
        }
        
        is_valid, errors = self.validate_request_data(plot_data, required_fields, field_validators)
        
        if not is_valid:
            return self.format_api_response(False, error="Validation failed", data={'validation_errors': errors}, status=400)
        
        try:
            # Create or update the plot
            plot, created = self.plot_controller.create_or_update_plot(plot_data, user)
            
            if not plot:
                return self.format_api_response(False, error="Failed to save plot", status=400)
            
            # Invalidate any cached data for this user/plot
            if user:
                from django.core.cache import cache
                cache.delete(f"editor_context_user_{user.id}_plot_{plot.id}")
                cache.delete(f"user_plots_{user.id}")
            
            return self.format_api_response(
                True,
                data={'plot_id': plot.id},
                message=f"Plot {'created' if created else 'updated'} successfully",
                status=200
            )
        except Exception as e:
            logger.error(f"Error saving plot: {e}")
            return self.format_api_response(False, error=f"An error occurred while saving the plot", status=500)
    
    def get_plot_data(self, plot_id, user):
        """
        Get formatted plot data for API response.
        
        Args:
            plot_id (int): ID of the plot to retrieve.
            user (User): The current user.
            
        Returns:
            dict: Formatted plot data or None if not found.
        """
        def load_plot_data():
            return self.plot_controller.get_plot_with_fixtures(plot_id, user)
            
        # Cache plot data to reduce API costs
        if user:
            cache_key = f"plot_data_{plot_id}_user_{user.id}"
            return self.cache_view_data(cache_key, load_plot_data)
        return load_plot_data()
    
    def format_plot_for_listing(self, plot):
        """
        Format a plot object for display in a listing.
        
        Args:
            plot: The plot object to format.
            
        Returns:
            dict: Formatted plot data.
        """
        return {
            'id': plot.id,
            'title': plot.title,
            'stage_name': plot.stage.name if plot.stage else 'Unknown Stage',
            'show_name': plot.show_name or 'Untitled Show',
            'venue': plot.venue or 'No Venue',
            'created_at': plot.created_at,
            'updated_at': plot.updated_at,
            'fixture_count': plot.fixtures.count(),
            'slug': slugify(plot.title)
        }
