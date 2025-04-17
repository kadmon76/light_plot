# designer/controllers/service_registry.py - Add controller getter methods

class ServiceRegistry:
    """
    Service registry to manage controller instances.
    
    This class implements the Singleton pattern to ensure there's only
    one instance of each controller throughout the application.
    """
    
    _instance = None
    
    @classmethod
    def get_instance(cls):
        """
        Get the singleton instance of ServiceRegistry.
        
        Returns:
            ServiceRegistry: The singleton instance.
        """
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
    
    def __init__(self):
        """Initialize the service registry"""
        self._plot_controller = None
        self._fixture_controller = None
        self._stage_controller = None
        self._template_controller = None
    
    def get_plot_controller(self):
        """
        Get the plot controller instance.
        
        Returns:
            PlotController: The plot controller instance.
        """
        if self._plot_controller is None:
            from .plot_controller import PlotController
            self._plot_controller = PlotController()
        return self._plot_controller
    
    def get_fixture_controller(self):
        """
        Get the fixture controller instance.
        
        Returns:
            FixtureController: The fixture controller instance.
        """
        if self._fixture_controller is None:
            from .fixture_controller import FixtureController
            self._fixture_controller = FixtureController()
        return self._fixture_controller
    
    def get_stage_controller(self):
        """
        Get the stage controller instance.
        
        Returns:
            StageController: The stage controller instance.
        """
        if self._stage_controller is None:
            from .stage_controller import StageController
            self._stage_controller = StageController()
        return self._stage_controller
    
    def get_template_controller(self):
        """
        Get the template controller instance.
        
        Returns:
            TemplateController: The template controller instance.
        """
        if self._template_controller is None:
            from .template_controller import TemplateController
            self._template_controller = TemplateController()
        return self._template_controller