# designer/presenters/base_presenter.py
from ..controllers.service_registry import ServiceRegistry

class BasePresenter:
    """
    Base presenter class that other presenters inherit from.
    
    Presenters handle the logic for preparing data to be displayed in views
    and processing user input from views to be sent to controllers.
    """
    
    def __init__(self):
        """
        Initialize the base presenter with access to the service registry.
        """
        self.service_registry = ServiceRegistry.get_instance()
