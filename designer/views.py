from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import LightFixture, StageTemplate, LightingPlot, Stage, PlotFixture

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

@login_required
def delete_plot(request, plot_id):
    """Delete a light plot"""
    plot = get_object_or_404(LightingPlot, id=plot_id, user=request.user)
    
    if request.method == 'POST':
        # Delete the plot
        plot.delete()
        return redirect('designer:my_plots')
    
    # For GET requests, show confirmation page
    return render(request, 'designer/delete_plot_confirm.html', {'plot': plot})

# API Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_plot(request):
    """API endpoint to save a lighting plot"""
    plot_id = request.data.get('plot_id')
    title = request.data.get('title', 'Untitled Plot')
    stage_id = request.data.get('stage_id')
    plot_data = request.data.get('plot_data', {})
    
    # Get or create the plot
    if plot_id:
        plot = get_object_or_404(LightingPlot, id=plot_id, user=request.user)
    else:
        # For a new plot, we need a stage
        if not stage_id:
            return Response({'error': 'Stage ID is required for new plots'}, status=400)
        
        stage = get_object_or_404(Stage, id=stage_id)
        plot = LightingPlot(
            title=title,
            user=request.user,
            stage=stage
        )
    
    # Update plot data
    plot.title = title
    
    # If stage is being changed
    if stage_id and (not plot_id or str(plot.stage.id) != stage_id):
        stage = get_object_or_404(Stage, id=stage_id)
        plot.stage = stage
    
    # Save plot data JSON
    plot.plot_data = plot_data
    
    # Additional metadata if provided
    if 'show_name' in request.data:
        plot.show_name = request.data.get('show_name')
    if 'venue' in request.data:
        plot.venue = request.data.get('venue')
    if 'designer' in request.data:
        plot.designer = request.data.get('designer')
    if 'date' in request.data:
        plot.date = request.data.get('date')
        
    plot.save()
    
    # If fixtures data is provided, update fixtures
    fixtures_data = request.data.get('fixtures', [])
    if fixtures_data:
        # First, remove existing fixtures if this is an update
        if plot_id:
            PlotFixture.objects.filter(plot=plot).delete()
            
        # Add new fixtures
        for fixture_data in fixtures_data:
            fixture_type = get_object_or_404(LightFixture, id=fixture_data.get('fixture_id'))
            
            plot_fixture = PlotFixture(
                plot=plot,
                fixture_type=fixture_type,
                x_position=fixture_data.get('x', 0),
                y_position=fixture_data.get('y', 0),
                rotation=fixture_data.get('rotation', 0),
                channel=fixture_data.get('channel'),
                dimmer=fixture_data.get('dimmer'),
                color=fixture_data.get('color', ''),
                purpose=fixture_data.get('purpose', ''),
                notes=fixture_data.get('notes', '')
            )
            plot_fixture.save()
    
    return Response({
        'success': True,
        'plot_id': plot.id,
        'message': 'Plot saved successfully'
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def load_plot(request, plot_id):
    """API endpoint to load a lighting plot"""
    plot = get_object_or_404(LightingPlot, id=plot_id, user=request.user)
    
    # Get all fixtures for this plot
    fixtures = PlotFixture.objects.filter(plot=plot)
    
    fixtures_data = []
    for fixture in fixtures:
        fixtures_data.append({
            'id': fixture.id,
            'fixture_id': fixture.fixture_type.id,
            'x': fixture.x_position,
            'y': fixture.y_position,
            'rotation': fixture.rotation,
            'channel': fixture.channel,
            'dimmer': fixture.dimmer,
            'color': fixture.color,
            'purpose': fixture.purpose,
            'notes': fixture.notes
        })
    
    response_data = {
        'plot': {
            'id': plot.id,
            'title': plot.title,
            'stage_id': plot.stage.id,
            'show_name': plot.show_name,
            'venue': plot.venue,
            'designer': plot.designer,
            'date': plot.date.isoformat() if plot.date else None,
            'plot_data': plot.plot_data
        },
        'fixtures': fixtures_data
    }
    
    return Response(response_data)
