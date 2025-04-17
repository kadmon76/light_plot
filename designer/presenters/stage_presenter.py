# designer/presenters/stage_presenter.py
from .base_presenter import BasePresenter

class StagePresenter(BasePresenter):
    """
    Presenter for stage views.
    
    This presenter handles the logic for preparing stage data to be displayed
    in views and processing user input related to stages.
    """
    
    def __init__(self):
        """
        Initialize the stage presenter.
        """
        super().__init__()
        self.stage_controller = self.service_registry.get_stage_controller()
    
    def get_all_stages_for_view(self):
        """
        Get all stages formatted for display in views.
        
        Returns:
            list: Formatted stage data for views.
        """
        stages = self.stage_controller.get_all_stages()
        
        # Format stages for view if needed
        stage_data = []
        for stage in stages:
            stage_data.append({
                'id': stage.id,
                'name': stage.name,
                'width': stage.width,
                'depth': stage.depth,
                'description': stage.description,
            })
        
        return stage_data
