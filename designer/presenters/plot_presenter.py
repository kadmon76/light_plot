# designer/presenters/plot_presenter.py
from .base_presenter import BasePresenter

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
    
    def get_user_plots_context(self, user):
        """
        Prepare context data for displaying user's plots.
        
        Args:
            user (User): The current user.
            
        Returns:
            dict: Context data with user's plots.
        """
        plots = self.plot_controller.get_plots_for_user(user)
        return {'plots': plots}
    
    def handle_plot_save(self, plot_data, user):
        """
        Process and validate plot data from a save request.
        
        Args:
            plot_data (dict): Plot data from the request.
            user (User): The current user.
            
        Returns:
            tuple: (success, result_data, status_code)
                - success (bool): Whether the operation was successful.
                - result_data (dict): Response data.
                - status_code (int): HTTP status code.
        """
        # Validate required fields
        if not plot_data.get('plot_id') and not plot_data.get('stage_id'):
            return False, {'error': 'Stage ID is required for new plots'}, 400
        
        # Create or update the plot
        plot, created = self.plot_controller.create_or_update_plot(plot_data, user)
        
        if not plot:
            return False, {'error': 'Error saving plot'}, 400
        
        return True, {
            'success': True,
            'plot_id': plot.id,
            'message': f"Plot {'created' if created else 'updated'} successfully"
        }, 200
    
    def get_plot_data(self, plot_id, user):
        """
        Get formatted plot data for API response.
        
        Args:
            plot_id (int): ID of the plot to retrieve.
            user (User): The current user.
            
        Returns:
            dict: Formatted plot data or None if not found.
        """
        return self.plot_controller.get_plot_with_fixtures(plot_id, user)
