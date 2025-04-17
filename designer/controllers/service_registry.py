# designer/controllers/service_registry.py
class ServiceRegistry:
    """
    Registry for managing service and controller instances.
    
    This class provides a central place to access controllers and other
    services, ensuring only one instance of each is created.
    """
    
    _instance = None
    _services = {}
    
    @classmethod
    def get_instance(cls):
        """
        Get the singleton instance of the service registry.
        
        Returns:
            ServiceRegistry: The service registry instance.
        """
        if cls._instance is None:
            cls._instance = ServiceRegistry()
        return cls._instance
    
    def register(self, service_class, *args, **kwargs):
        """
        Register a service with the registry.
        
        Args:
            service_class: The class of the service to register.
            *args, **kwargs: Arguments to pass to the service constructor.
            
        Returns:
            object: The registered service instance.
        """
        class_name = service_class.__name__
        if class_name not in self._services:
            self._services[class_name] = service_class(*args, **kwargs)
        return self._services[class_name]
    
    def get(self, service_class):
        """
        Get a service from the registry.
        
        Args:
            service_class: The class of the service to get.
            
        Returns:
            object: The service instance or None if not registered.
        """
        class_name = service_class.__name__
        if class_name not in self._services:
            return self.register(service_class)
        return self._services[class_name]