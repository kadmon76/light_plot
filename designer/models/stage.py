from django.db import models

class Stage(models.Model):
    """Model representing a stage setup"""
    name = models.CharField(max_length=100)
    width = models.FloatField(help_text="Width in meters/feet")
    depth = models.FloatField(help_text="Depth in meters/feet")
    height = models.FloatField(help_text="Height in meters/feet")
    
    # SVG representation of the stage shape
    svg_data = models.TextField(blank=True, help_text="SVG vector data for custom stage shape")
    
    # Units used (metric or imperial)
    UNIT_CHOICES = [
        ('m', 'Meters'),
        ('ft', 'Feet'),
    ]
    unit = models.CharField(max_length=2, choices=UNIT_CHOICES, default='m')
    
    # Additional stage properties
    has_fly_system = models.BooleanField(default=False)
    has_pit = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.width}x{self.depth} {self.get_unit_display()})"