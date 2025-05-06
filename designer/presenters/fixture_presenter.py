# designer/presenters/fixture_presenter.py
from .base_presenter import BasePresenter

class FixturePresenter(BasePresenter):
    """
    Presenter for lighting fixture views.
    
    This presenter handles the logic for preparing fixture data to be displayed
    in views and processing user input related to fixtures.
    """
    
    def __init__(self):
        """
        Initialize the fixture presenter.
        """
        super().__init__()
        self.fixture_controller = self.service_registry.get_fixture_controller()
    
    def get_all_fixtures_for_view(self):
        """
        Get all fixtures formatted for display in views.
        
        Returns:
            list: Formatted fixture data for views.
        """
        fixtures = self.fixture_controller.get_all_fixtures()
        
        # Format fixtures for view if needed
        fixture_data = []
        for fixture in fixtures:
            fixture_data.append({
                'id': fixture.id,
                'name': fixture.name,
                'type': fixture.fixture_type,
                'wattage': fixture.wattage,
                'weight': fixture.weight,
                'icon': fixture.icon_url,
                'svg_data': fixture.svg_icon
            })
        
        return fixture_data
