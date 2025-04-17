# designer/controllers/fixture_controller.py
from .base_controller import BaseController
from ..models import LightFixture

class FixtureController(BaseController):
    """
    Controller for managing lighting fixtures.
    
    This controller handles operations related to lighting fixtures, including
    retrieving fixtures, creating new fixtures, and updating existing ones.
    """
    
    def __init__(self):
        """Initialize the fixture controller"""
        super().__init__()
        self.model = LightFixture
    
    def get_all_fixtures(self):
        """
        Get all light fixtures.
        
        Returns:
            QuerySet: All LightFixture objects.
        """
        return self.model.objects.all()
    
    def get_fixture_by_id(self, fixture_id):
        """
        Retrieve a specific lighting fixture by ID.
        
        Args:
            fixture_id (int): ID of the fixture to retrieve.
            
        Returns:
            LightFixture: The requested fixture or None if not found.
        """
        try:
            return LightFixture.objects.get(id=fixture_id)
        except LightFixture.DoesNotExist:
            return None
    
    def create_fixture(self, fixture_data):
        """
        Create a new lighting fixture.
        
        Args:
            fixture_data (dict): Data for the new fixture.
            
        Returns:
            LightFixture: The newly created fixture.
        """
        fixture = LightFixture(**fixture_data)
        fixture.save()
        return fixture