from django.db import models

class StageTemplate(models.Model):
    """Model representing predefined lighting position templates"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    # Template type (front lights, high cross, back light, etc.)
    TEMPLATE_TYPE_CHOICES = [
        ('front', 'Front Lights'),
        ('side', 'Side Lights'),
        ('back', 'Back Lights'),
        ('top', 'Top Lights'),
        ('cyc', 'Cyclorama Lights'),
        ('special', 'Special'),
        ('custom', 'Custom'),
    ]
    template_type = models.CharField(max_length=20, choices=TEMPLATE_TYPE_CHOICES)
    
    # Template data in JSON format
    positions_data = models.JSONField(help_text="JSON data defining fixture positions")
    
    # Preview image as SVG
    preview_svg = models.TextField(blank=True, help_text="SVG preview of the template")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['template_type', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_template_type_display()})"