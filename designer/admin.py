from django.contrib import admin
from .models import LightFixture, StageTemplate, LightingPlot, PlotFixture, Stage, Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'element_type', 'parent')
    list_filter = ('element_type', 'parent')
    search_fields = ('name', 'description')

@admin.register(LightFixture)
class LightFixtureAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'manufacturer')
    list_filter = ('category', 'manufacturer')
    search_fields = ('name', 'category__name')

@admin.register(StageTemplate)
class StageTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'template_type')
    list_filter = ('template_type',)
    search_fields = ('name', 'description')

@admin.register(Stage)
class StageAdmin(admin.ModelAdmin):
    list_display = ('name', 'width', 'depth', 'height', 'unit')
    list_filter = ('unit', 'has_fly_system', 'has_pit')
    search_fields = ('name',)

class PlotFixtureInline(admin.TabularInline):
    model = PlotFixture
    extra = 1

@admin.register(LightingPlot)
class LightingPlotAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'stage', 'show_name', 'venue', 'updated_at')
    list_filter = ('user', 'stage')
    search_fields = ('title', 'show_name', 'venue')
    inlines = [PlotFixtureInline]

@admin.register(PlotFixture)
class PlotFixtureAdmin(admin.ModelAdmin):
    list_display = ('fixture_type', 'plot', 'channel', 'purpose')
    list_filter = ('fixture_type', 'plot')
    search_fields = ('purpose', 'notes', 'channel')
