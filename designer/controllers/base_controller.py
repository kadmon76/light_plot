# designer/controllers/base_controller.py
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

class BaseController:
    """
    Base controller class that other controllers inherit from.
    
    This class provides common functionality for all controllers like
    basic CRUD operations, caching, and error handling.
    """
    
    def __init__(self, model=None, cache_timeout=300):
        """
        Initialize the base controller.
        
        Args:
            model: The model class this controller handles (optional)
            cache_timeout: Timeout for cached items in seconds (default: 300)
        """
        self.model = model
        self.cache_timeout = cache_timeout
    
    def get_all(self):
        """
        Get all instances of the model.
        
        Returns:
            QuerySet: All model instances.
        """
        if not self.model:
            return None
            
        try:
            return self.model.objects.all()
        except Exception as e:
            logger.error(f"Error retrieving all {self.model.__name__} instances: {e}")
            return None
    
    def get_by_id(self, instance_id, use_cache=True):
        """
        Get a model instance by ID with optional caching.
        
        Args:
            instance_id (int): ID of the instance to retrieve
            use_cache (bool): Whether to use cache
            
        Returns:
            Model instance or None if not found
        """
        if not self.model:
            return None
            
        # Try to get from cache first
        if use_cache:
            cache_key = f"{self.model.__name__.lower()}_id_{instance_id}"
            cached_instance = cache.get(cache_key)
            if cached_instance:
                return cached_instance
        
        try:
            instance = self.model.objects.get(id=instance_id)
            
            # Store in cache for future requests
            if use_cache:
                cache_key = f"{self.model.__name__.lower()}_id_{instance_id}"
                cache.set(cache_key, instance, self.cache_timeout)
                
            return instance
        except self.model.DoesNotExist:
            return None
        except Exception as e:
            logger.error(f"Error retrieving {self.model.__name__} with ID {instance_id}: {e}")
            return None
    
    def create(self, data):
        """
        Create a new model instance.
        
        Args:
            data (dict): Data for the new instance
            
        Returns:
            Model instance: The newly created instance or None if error
        """
        if not self.model:
            return None
            
        try:
            instance = self.model(**data)
            instance.save()
            return instance
        except Exception as e:
            logger.error(f"Error creating new {self.model.__name__}: {e}")
            return None
    
    def update(self, instance_id, data):
        """
        Update an existing model instance.
        
        Args:
            instance_id (int): ID of the instance to update
            data (dict): Updated data
            
        Returns:
            Model instance: The updated instance or None if error
        """
        instance = self.get_by_id(instance_id, use_cache=False)
        if not instance:
            return None
            
        try:
            for key, value in data.items():
                if hasattr(instance, key):
                    setattr(instance, key, value)
                    
            instance.save()
            
            # Update cache
            cache_key = f"{self.model.__name__.lower()}_id_{instance_id}"
            cache.set(cache_key, instance, self.cache_timeout)
            
            return instance
        except Exception as e:
            logger.error(f"Error updating {self.model.__name__} with ID {instance_id}: {e}")
            return None
    
    def delete(self, instance_id):
        """
        Delete a model instance.
        
        Args:
            instance_id (int): ID of the instance to delete
            
        Returns:
            bool: True if successful, False otherwise
        """
        instance = self.get_by_id(instance_id, use_cache=False)
        if not instance:
            return False
            
        try:
            instance.delete()
            
            # Remove from cache
            cache_key = f"{self.model.__name__.lower()}_id_{instance_id}"
            cache.delete(cache_key)
            
            return True
        except Exception as e:
            logger.error(f"Error deleting {self.model.__name__} with ID {instance_id}: {e}")
            return False
            
    def invalidate_cache(self, instance_id=None):
        """
        Invalidate cache for a specific instance or all instances.
        
        Args:
            instance_id (int, optional): ID of the instance to invalidate cache for
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            if instance_id:
                # Invalidate specific instance
                cache_key = f"{self.model.__name__.lower()}_id_{instance_id}"
                cache.delete(cache_key)
            else:
                # Invalidate all instances (pattern-based delete)
                cache_key_pattern = f"{self.model.__name__.lower()}_id_*"
                # Note: Django's cache doesn't support pattern-based delete natively
                # This is a placeholder; real implementation would depend on cache backend
            return True
        except Exception as e:
            logger.error(f"Error invalidating cache for {self.model.__name__}: {e}")
            return False