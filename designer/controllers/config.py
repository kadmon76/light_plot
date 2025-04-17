# designer/controllers/config.py
"""
Configuration file for controller registry.

This file defines the mapping between controller names and their classes,
making it easier to register and retrieve controllers.
"""

from .fixture_controller import FixtureController
from .plot_controller import PlotController
from .stage_controller import StageController
from .template_controller import TemplateController

# Controller registry configuration
CONTROLLER_REGISTRY = {
    'plot': PlotController,
    'fixture': FixtureController,
    'stage': StageController,
    'template': TemplateController,
}