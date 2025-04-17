from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import Http404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .presenters.presenter_registry import PresenterRegistry

# Frontend views
def index(request):
    """Home page view"""
    return render(request, 'designer/index.html')

@login_required
def plot_editor(request, plot_id=None):
    """Main editor view for lighting plots"""
    # Get plot presenter from PresenterRegistry
    plot_presenter = PresenterRegistry.get_instance().get_plot_presenter()
    
    # Use presenter to get context data
    context = plot_presenter.get_editor_context(plot_id, request.user)
    
    return render(request, 'designer/editor.html', context)

@login_required
def my_plots(request):
    """View for listing user's plots"""
    # Get plot presenter from PresenterRegistry
    plot_presenter = PresenterRegistry.get_instance().get_plot_presenter()
    
    # Use presenter to get user's plots context
    context = plot_presenter.get_user_plots_context(request.user)
    return render(request, 'designer/my_plots.html', context)

@login_required
def delete_plot(request, plot_id):
    """Delete a light plot"""
    # Get plot controller and presenter from ServiceRegistry
    service_registry = PresenterRegistry.get_instance()
    plot_presenter = service_registry.get_plot_presenter()
    plot_controller = plot_presenter.plot_controller
    
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
    # Get plot presenter from PresenterRegistry
    plot_presenter = PresenterRegistry.get_instance().get_plot_presenter()
    
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
    
    # Use presenter to handle plot save
    success, result_data, status_code = plot_presenter.handle_plot_save(plot_data, request.user)
    
    return Response(result_data, status=status_code)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def load_plot(request, plot_id):
    """API endpoint to load a lighting plot"""
    # Get plot presenter from PresenterRegistry
    plot_presenter = PresenterRegistry.get_instance().get_plot_presenter()
    
    # Get plot data with fixtures using presenter
    plot_data = plot_presenter.get_plot_data(plot_id, request.user)
    if not plot_data:
        raise Http404("Plot does not exist")
    
    return Response(plot_data)