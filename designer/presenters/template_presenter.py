# designer/presenters/template_presenter.py
from .base_presenter import BasePresenter

class TemplatePresenter(BasePresenter):
    """
    Presenter for stage template views.
    
    This presenter handles the logic for preparing template data to be displayed
    in views and processing user input related to templates.
    """
    
    def __init__(self):
        """
        Initialize the template presenter.
        """
        super().__init__()
        self.template_controller = self.service_registry.get_template_controller()
    
    def get_all_templates_for_view(self):
        """
        Get all templates formatted for display in views.
        
        Returns:
            list: Formatted template data for views.
        """
        templates = self.template_controller.get_all_templates()
        
        # Format templates for view if needed
        template_data = []
        for template in templates:
            template_data.append({
                'id': template.id,
                'name': template.name,
                'type': template.template_type,
                'description': template.description,
            })
        
        return template_data
    
    def get_templates_by_type_for_view(self, template_type):
        """
        Get templates of a specific type formatted for display in views.
        
        Args:
            template_type (str): The type of templates to retrieve.
            
        Returns:
            list: Formatted template data for views.
        """
        templates = self.template_controller.get_templates_by_type(template_type)
        
        # Format templates for view if needed
        template_data = []
        for template in templates:
            template_data.append({
                'id': template.id,
                'name': template.name,
                'type': template.template_type,
                'description': template.description,
            })
        
        return template_data
