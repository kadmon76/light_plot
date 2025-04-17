# designer/controllers/base_controller.py
class BaseController:
    """Base controller class that other controllers inherit from"""
    
    def __init__(self, model=None):
        """
        Initialize the base controller.
        
        Args:
            model: The model class this controller handles (optional)
        """
        self.model = model