from django.db import models
from django.conf import settings

class LightingPlot(models.Model):
    """Model representing a complete lighting plot design"""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # User who created this plot
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='plots')
    
    # Associated stage
    stage = models.ForeignKey('Stage', on_delete=models.CASCADE)
    
    # Plot metadata
    show_name = models.CharField(max_length=200, blank=True)
    venue = models.CharField(max_length=200, blank=True)
    designer = models.CharField(max_length=100, blank=True)
    date = models.DateField(null=True, blank=True)
    
    # Plot data - could store the entire SVG or JSON representation
    plot_data = models.JSONField(default=dict, help_text="JSON data of the entire plot")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.title

class PlotFixture(models.Model):
    """Model representing a fixture instance placed in a lighting plot"""
    plot = models.ForeignKey('LightingPlot', on_delete=models.CASCADE, related_name='fixtures')
    fixture_type = models.ForeignKey('LightFixture', on_delete=models.CASCADE)
    
    # Position and orientation
    x_position = models.FloatField()
    y_position = models.FloatField()
    z_position = models.FloatField(default=0)
    rotation = models.FloatField(default=0)
    
    # Fixture properties
    channel = models.IntegerField(null=True, blank=True)
    dimmer = models.IntegerField(null=True, blank=True)
    circuit = models.CharField(max_length=20, blank=True)
    color = models.CharField(max_length=20, blank=True)
    
    # Notes
    purpose = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['channel']
    
    def __str__(self):
        return f"{self.fixture_type.name} ({self.channel or 'No Channel'})"