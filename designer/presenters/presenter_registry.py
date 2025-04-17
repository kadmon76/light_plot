# designer/presenters/presenter_registry.py

class PresenterRegistry:
    """
    Registry for presenter instances.
    
    This class implements the Singleton pattern to ensure there's only
    one instance of each presenter throughout the application.
    """
    
    _instance = None
    
    @classmethod
    def get_instance(cls):
        """
        Get the singleton instance of PresenterRegistry.
        
        Returns:
            PresenterRegistry: The singleton instance.
        """
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
    
    def __init__(self):
        """
        Initialize the presenter registry
        """
        self._plot_presenter = None
        self._fixture_presenter = None
        self._stage_presenter = None
        self._template_presenter = None
    
    def get_plot_presenter(self):
        """
        Get the plot presenter instance.
        
        Returns:
            PlotPresenter: The plot presenter instance.
        """
        if self._plot_presenter is None:
            from .plot_presenter import PlotPresenter
            self._plot_presenter = PlotPresenter()
        return self._plot_presenter
    
    def get_fixture_presenter(self):
        """
        Get the fixture presenter instance.
        
        Returns:
            FixturePresenter: The fixture presenter instance.
        """
        if self._fixture_presenter is None:
            from .fixture_presenter import FixturePresenter
            self._fixture_presenter = FixturePresenter()
        return self._fixture_presenter
    
    def get_stage_presenter(self):
        """
        Get the stage presenter instance.
        
        Returns:
            StagePresenter: The stage presenter instance.
        """
        if self._stage_presenter is None:
            from .stage_presenter import StagePresenter
            self._stage_presenter = StagePresenter()
        return self._stage_presenter
    
    def get_template_presenter(self):
        """
        Get the template presenter instance.
        
        Returns:
            TemplatePresenter: The template presenter instance.
        """
        if self._template_presenter is None:
            from .template_presenter import TemplatePresenter
            self._template_presenter = TemplatePresenter()
        return self._template_presenter
