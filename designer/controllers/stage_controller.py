# designer/controllers/stage_controller.py
from .base_controller import BaseController
from ..models import Stage

class StageController(BaseController):
    """
    Controller for managing stages.
    
    This controller handles operations related to stages, including
    retrieving stages, creating new stages, and updating existing ones.
    """
    
    def __init__(self):
        """Initialize the stage controller"""
        super().__init__()
    
    def get_all_stages(self):
        """
        Retrieve all stages in the system.
        
        Returns:
            QuerySet: All Stage objects.
        """
        return self.model.objects.all()
    
    def get_stage_by_id(self, stage_id):
        """
        Retrieve a specific stage by ID.
        
        Args:
            stage_id (int): ID of the stage to retrieve.
            
        Returns:
            Stage: The requested stage or None if not found.
        """
        try:
            return Stage.objects.get(id=stage_id)
        except Stage.DoesNotExist:
            return None
    
    def create_stage(self, stage_data):
        """
        Create a new stage.
        
        Args:
            stage_data (dict): Data for the new stage.
            
        Returns:
            Stage: The newly created stage.
        """
        stage = Stage(**stage_data)
        stage.save()
        return stage
    
    def update_stage(self, stage_id, stage_data):
        """
        Update an existing stage.
        
        Args:
            stage_id (int): ID of the stage to update.
            stage_data (dict): Updated data for the stage.
            
        Returns:
            Stage: The updated stage or None if not found.
        """
        stage = self.get_stage_by_id(stage_id)
        if not stage:
            return None
            
        for key, value in stage_data.items():
            if hasattr(stage, key):
                setattr(stage, key, value)
                
        stage.save()
        return stage
    
    def delete_stage(self, stage_id):
        """
        Delete a stage.
        
        Args:
            stage_id (int): ID of the stage to delete.
            
        Returns:
            bool: True if successful, False otherwise.
        """
        stage = self.get_stage_by_id(stage_id)
        if not stage:
            return False
            
        stage.delete()
        return True