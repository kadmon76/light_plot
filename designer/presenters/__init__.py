# designer/presenters/__init__.py
from .presenter_registry import PresenterRegistry
from .registry_manager import initialize_registry, get_registry
from .plot_presenter import PlotPresenter
from .fixture_presenter import FixturePresenter
from .stage_presenter import StagePresenter
from .template_presenter import TemplatePresenter

# Initialize the registry when the module is imported
initialize_registry()