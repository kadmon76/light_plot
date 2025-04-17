# designer/controllers/__init__.py
from .base_controller import BaseController
from .fixture_controller import FixtureController
from .plot_controller import PlotController
from .stage_controller import StageController
from .template_controller import TemplateController
from .service_registry import ServiceRegistry

# Export the registry getter for easy access
get_registry = ServiceRegistry.get_instance

__all__ = [
    'BaseController',
    'FixtureController',
    'PlotController',
    'StageController',
    'TemplateController',
    'ServiceRegistry',
    'get_registry',
]