from django.db import models

class LightFixture(models.Model):
    """Model representing a type of lighting fixture"""
    name = models.CharField(max_length=100)
    manufacturer = models.CharField(max_length=100)
    fixture_type = models.CharField(max_length=50)
    wattage = models.IntegerField(default=0)
    beam_angle = models.FloatField(default=0.0)
    weight = models.FloatField(default=0.0)
    svg_icon = models.TextField(help_text="SVG vector data for the fixture")
    
    # Properties for visualization
    width = models.FloatField(default=1.0)
    height = models.FloatField(default=1.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.fixture_type})"