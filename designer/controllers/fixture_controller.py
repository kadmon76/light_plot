# designer/controllers/fixture_controller.py
import logging
from .base_controller import BaseController
from ..models import LightFixture

logger = logging.getLogger(__name__)

class FixtureController(BaseController):
    """
    Controller for managing lighting fixtures.
    
    This controller handles operations related to lighting fixtures, including
    retrieving fixtures, creating new fixtures, and updating existing ones.
    """
    
    def __init__(self, cache_timeout=3600):  # Cache fixtures for 1 hour by default
        """
        Initialize the fixture controller
        
        Args:
            cache_timeout (int): Cache timeout in seconds
        """
        super().__init__(LightFixture, cache_timeout)
    
    def get_all_fixtures(self):
        """
        Get all light fixtures.
        
        Returns:
            QuerySet: All LightFixture objects.
        """
        return self.get_all()
    
    def get_fixture_by_id(self, fixture_id):
        """
        Retrieve a specific lighting fixture by ID.
        
        Args:
            fixture_id (int): ID of the fixture to retrieve.
            
        Returns:
            LightFixture: The requested fixture or None if not found.
        """
        return self.get_by_id(fixture_id)
    
    def create_fixture(self, fixture_data):
        """
        Create a new lighting fixture.
        
        Args:
            fixture_data (dict): Data for the new fixture.
            
        Returns:
            LightFixture: The newly created fixture.
        """
        return self.create(fixture_data)
    
    def update_fixture(self, fixture_id, fixture_data):
        """
        Update an existing lighting fixture.
        
        Args:
            fixture_id (int): ID of the fixture to update.
            fixture_data (dict): Updated data for the fixture.
            
        Returns:
            LightFixture: The updated fixture or None if not found.
        """
        return self.update(fixture_id, fixture_data)
    
    def delete_fixture(self, fixture_id):
        """
        Delete a lighting fixture.
        
        Args:
            fixture_id (int): ID of the fixture to delete.
            
        Returns:
            bool: True if successful, False otherwise.
        """
        return self.delete(fixture_id)
    
    def get_fixtures_by_type(self, fixture_type):
        """
        Get fixtures of a specific type.
        
        Args:
            fixture_type (str): Type of fixtures to retrieve.
            
        Returns:
            QuerySet: LightFixture objects of the specified type.
        """
        try:
            return LightFixture.objects.filter(fixture_type=fixture_type)
        except Exception as e:
            logger.error(f"Error retrieving fixtures by type {fixture_type}: {e}")
            return []