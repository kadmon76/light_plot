# designer/presenters/base_presenter.py
import logging
from django.core.cache import cache
from ..controllers.service_registry import ServiceRegistry

logger = logging.getLogger(__name__)

class BasePresenter:
    """
    Base presenter class that other presenters inherit from.
    
    Presenters handle the logic for preparing data to be displayed in views
    and processing user input from views to be sent to controllers.
    """
    
    def __init__(self, cache_timeout=600):
        """
        Initialize the base presenter with access to the service registry.
        
        Args:
            cache_timeout (int): Timeout for cached items in seconds (default: 600)
        """
        self.service_registry = ServiceRegistry.get_instance()
        self.cache_timeout = cache_timeout
    
    def format_api_response(self, success, data=None, message=None, error=None, status=200):
        """
        Format a standard API response.
        
        Args:
            success (bool): Whether the operation was successful
            data (any, optional): Data to include in the response
            message (str, optional): Message to include in the response
            error (str, optional): Error message if success is False
            status (int, optional): HTTP status code (default: 200)
            
        Returns:
            tuple: (response_data, status_code)
        """
        response = {
            'success': success
        }
        
        if data is not None:
            response['data'] = data
            
        if message:
            response['message'] = message
            
        if error:
            response['error'] = error
            
        return response, status
    
    def cache_view_data(self, key, data_func, *args, **kwargs):
        """
        Cache view data to reduce database queries.
        
        Args:
            key (str): Cache key
            data_func (callable): Function to call if cache miss
            *args, **kwargs: Arguments to pass to data_func
            
        Returns:
            any: The cached or freshly retrieved data
        """
        cached_data = cache.get(key)
        if cached_data is not None:
            return cached_data
            
        try:
            data = data_func(*args, **kwargs)
            cache.set(key, data, self.cache_timeout)
            return data
        except Exception as e:
            logger.error(f"Error caching view data for key {key}: {e}")
            # Fall back to retrieving uncached data
            return data_func(*args, **kwargs)
    
    def validate_request_data(self, data, required_fields=None, field_validators=None):
        """
        Validate request data against required fields and custom validators.
        
        Args:
            data (dict): The data to validate
            required_fields (list, optional): List of required field names
            field_validators (dict, optional): Dict mapping field names to validator functions
            
        Returns:
            tuple: (is_valid, errors_dict)
        """
        errors = {}
        
        # Check required fields
        if required_fields:
            for field in required_fields:
                if field not in data or data[field] is None or data[field] == '':
                    errors[field] = f"{field} is required"
        
        # Apply custom validators
        if field_validators and not errors:
            for field, validator in field_validators.items():
                if field in data:
                    try:
                        result = validator(data[field])
                        if result is not True:
                            errors[field] = result
                    except Exception as e:
                        errors[field] = str(e)
        
        return (len(errors) == 0, errors)
