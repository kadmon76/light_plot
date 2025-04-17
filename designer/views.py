from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import Http404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .controllers.service_registry import ServiceRegistry

# Frontend views
def index(request):
    """Home page view"""
    return render(request, 'designer/index.html')

@login_required
def plot_editor(request, plot_id=None):
    """Main editor view for lighting plots"""
    context = {}
    
    # Get controllers from ServiceRegistry
    service_registry = ServiceRegistry.get_instance()
    plot_controller = service_registry.get_plot_controller()
    fixture_controller = service_registry.get_fixture_controller()
    template_controller = service_registry.get_template_controller()
    stage_controller = service_registry.get_stage_controller()
    
    if plot_id:
        # Use plot controller to get the plot
        plot = plot_controller.get_plot_by_id(plot_id, request.user)
        if not plot:
            raise Http404("Plot does not exist")
        context['plot'] = plot
    
    # Use controllers to get fixtures, templates and stages
    context['fixtures'] = fixture_controller.get_all_fixtures()
    context['templates'] = template_controller.get_all_templates()
    context['stages'] = stage_controller.get_all_stages()
    
    return render(request, 'designer/editor.html', context)

@login_required
def my_plots(request):
    """View for listing user's plots"""
    # Get the PlotController from ServiceRegistry
    plot_controller = ServiceRegistry.get_instance().get_plot_controller()
    
    # Use the controller to get plots for the user
    plots = plot_controller.get_plots_for_user(request.user)
    return render(request, 'designer/my_plots.html', {'plots': plots})

@login_required
def delete_plot(request, plot_id):
    """Delete a light plot"""
    # Get PlotController from ServiceRegistry
    plot_controller = ServiceRegistry.get_instance().get_plot_controller()
    
    # Get the plot for this user
    plot = plot_controller.get_plot_by_id(plot_id, request.user)
    if not plot:
        raise Http404("Plot does not exist")
    
    if request.method == 'POST':
        # Use controller to delete the plot
        plot_controller.delete_plot(plot_id, request.user)
        return redirect('designer:my_plots')
    
    # For GET requests, show confirmation page
    return render(request, 'designer/delete_plot_confirm.html', {'plot': plot})

# API Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_plot(request):
    """API endpoint to save a lighting plot"""
    # Get controllers
    service_registry = ServiceRegistry.get_instance()
    plot_controller = service_registry.get_plot_controller()
    
    # Prepare plot data
    plot_data = {
        'plot_id': request.data.get('plot_id'),
        'title': request.data.get('title', 'Untitled Plot'),
        'stage_id': request.data.get('stage_id'),
        'show_name': request.data.get('show_name', ''),
        'venue': request.data.get('venue', ''),
        'designer': request.data.get('designer', ''),
        'date': request.data.get('date'),
        'plot_data': request.data.get('plot_data', {}),
        'fixtures': request.data.get('fixtures', [])
    }
    
    # Validate required fields for new plots
    if not plot_data['plot_id'] and not plot_data['stage_id']:
        return Response({'error': 'Stage ID is required for new plots'}, status=400)
    
    # Create or update the plot
    plot, created = plot_controller.create_or_update_plot(plot_data, request.user)
    
    if not plot:
        return Response({'error': 'Error saving plot'}, status=400)
    
    return Response({
        'success': True,
        'plot_id': plot.id,
        'message': f"Plot {'created' if created else 'updated'} successfully"
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def load_plot(request, plot_id):
    """API endpoint to load a lighting plot"""
    # Get controllers
    plot_controller = ServiceRegistry.get_instance().get_plot_controller()
    
    # Get plot data with fixtures using controller
    plot_data = plot_controller.get_plot_with_fixtures(plot_id, request.user)
    if not plot_data:
        raise Http404("Plot does not exist")
    
    return Response(plot_data)