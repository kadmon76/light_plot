from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import LightFixture, StageTemplate, LightingPlot, Stage

# Frontend views
def index(request):
    """Home page view"""
    return render(request, 'designer/index.html')

@login_required
def plot_editor(request, plot_id=None):
    """Main editor view for lighting plots"""
    context = {}
    
    if plot_id:
        plot = get_object_or_404(LightingPlot, id=plot_id, user=request.user)
        context['plot'] = plot
    
    # Get all fixtures and templates for the editor
    context['fixtures'] = LightFixture.objects.all()
    context['templates'] = StageTemplate.objects.all()
    context['stages'] = Stage.objects.all()
    
    return render(request, 'designer/editor.html', context)

@login_required
def my_plots(request):
    """View for listing user's plots"""
    plots = LightingPlot.objects.filter(user=request.user)
    return render(request, 'designer/my_plots.html', {'plots': plots})

# API Views for AJAX operations will be added later with DRF viewsets
