# designer/presenters/config.py
"""
Configuration file for presenter registry.

This file defines the mapping between presenter names and their classes,
making it easier to register and retrieve presenters.
"""

from .plot_presenter import PlotPresenter
from .fixture_presenter import FixturePresenter
from .stage_presenter import StagePresenter
from .template_presenter import TemplatePresenter

# Presenter registry configuration
PRESENTER_REGISTRY = {
    'plot': PlotPresenter,
    'fixture': FixturePresenter,
    'stage': StagePresenter,
    'template': TemplatePresenter,
}