# designer/presenters/registry_manager.py
"""
Initialize and manage the presenter registry.

This is a convenience module to initialize all presenters and make them available
through the presenter registry.
"""

from .presenter_registry import PresenterRegistry
from .config import PRESENTER_REGISTRY

def initialize_registry():
    """
    Initialize the presenter registry with all presenters.
    
    Returns:
        PresenterRegistry: The initialized registry instance.
    """
    registry = PresenterRegistry.get_instance()
    
    # Force initialization of all presenters
    registry.get_plot_presenter()
    registry.get_fixture_presenter()
    registry.get_stage_presenter()
    registry.get_template_presenter()
    
    return registry

def get_registry():
    """
    Get the presenter registry instance.
    
    Returns:
        PresenterRegistry: The registry instance.
    """
    return PresenterRegistry.get_instance()