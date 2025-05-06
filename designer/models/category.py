from django.db import models
from django.core.exceptions import ValidationError

class Category(models.Model):
    """
    Generic category model for organizing elements in a tree structure.
    Can be used for fixtures, pipes, theatre elements, etc.
    """
    name = models.CharField(max_length=100)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='children')
    element_type = models.CharField(max_length=50, help_text="Type of elements this category contains (fixture, pipe, etc.)")
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0, help_text="Order in which this category should be displayed")
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['element_type', 'order', 'name']
        unique_together = ['name', 'parent', 'element_type']
    
    def __str__(self):
        return f"{self.element_type}: {self.name}"
    
    def clean(self):
        # Prevent circular references
        if self.parent and self.parent.element_type != self.element_type:
            raise ValidationError("Parent category must be of the same element type")
        
        # Check for circular parent references
        if self.parent:
            parent = self.parent
            while parent:
                if parent == self:
                    raise ValidationError("Circular reference detected in category hierarchy")
                parent = parent.parent
    
    def get_ancestors(self):
        """Get all ancestors of this category"""
        ancestors = []
        parent = self.parent
        while parent:
            ancestors.append(parent)
            parent = parent.parent
        return ancestors
    
    def get_descendants(self):
        """Get all descendants of this category"""
        descendants = []
        for child in self.children.all():
            descendants.append(child)
            descendants.extend(child.get_descendants())
        return descendants
    
    def get_siblings(self):
        """Get all siblings of this category"""
        if self.parent:
            return self.parent.children.exclude(id=self.id)
        return Category.objects.filter(parent=None, element_type=self.element_type).exclude(id=self.id)
    
    def get_root(self):
        """Get the root category of this category"""
        if self.parent:
            return self.parent.get_root()
        return self 