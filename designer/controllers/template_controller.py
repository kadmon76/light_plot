# designer/controllers/template_controller.py
from .base_controller import BaseController
from ..models import StageTemplate

class TemplateController(BaseController):
    """
    Controller for managing stage templates.
    
    This controller handles operations related to stage templates, including
    retrieving templates, creating new templates, and applying templates to stages.
    """
    
    def __init__(self):
        """Initialize the template controller"""
        super().__init__()
    
    def get_all_templates(self):
        """
        Retrieve all stage templates in the system.
        
        Returns:
            QuerySet: All StageTemplate objects.
        """
        return StageTemplate.objects.all()
    
    def get_templates_by_type(self, template_type):
        """
        Retrieve all templates of a specific type.
        
        Args:
            template_type (str): The type of templates to retrieve.
            
        Returns:
            QuerySet: StageTemplate objects of the specified type.
        """
        return StageTemplate.objects.filter(template_type=template_type)
    
    def get_template_by_id(self, template_id):
        """
        Retrieve a specific template by ID.
        
        Args:
            template_id (int): ID of the template to retrieve.
            
        Returns:
            StageTemplate: The requested template or None if not found.
        """
        try:
            return StageTemplate.objects.get(id=template_id)
        except StageTemplate.DoesNotExist:
            return None
    
    def create_template(self, template_data):
        """
        Create a new stage template.
        
        Args:
            template_data (dict): Data for the new template.
            
        Returns:
            StageTemplate: The newly created template.
        """
        template = StageTemplate(**template_data)
        template.save()
        return template
    
    def update_template(self, template_id, template_data):
        """
        Update an existing stage template.
        
        Args:
            template_id (int): ID of the template to update.
            template_data (dict): Updated data for the template.
            
        Returns:
            StageTemplate: The updated template or None if not found.
        """
        template = self.get_template_by_id(template_id)
        if not template:
            return None
            
        for key, value in template_data.items():
            if hasattr(template, key):
                setattr(template, key, value)
                
        template.save()
        return template