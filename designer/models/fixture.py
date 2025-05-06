from django.db import models

class LightFixture(models.Model):
    """Model representing a type of lighting fixture"""
    name = models.CharField(max_length=100)
    manufacturer = models.CharField(max_length=100)
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, blank=True, related_name='fixtures')
    
    # New fields for properties
    channel = models.CharField(max_length=20, blank=True, null=True, default='1')
    dimmer = models.CharField(max_length=20, blank=True, null=True)
    color = models.CharField(max_length=7, blank=True, null=True, default='#0066cc')
    purpose = models.CharField(max_length=200, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
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
        ordering = ['category', 'name']
    
    def __str__(self):
        category_name = self.category.name if self.category else 'Uncategorized'
        return f"{self.name} ({category_name})"