from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import Http404
from django.core.cache import cache
from django.views.decorators.cache import cache_page
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import logging

from .presenters import get_registry
from .models import LightFixture
# Set up logging
logger = logging.getLogger(__name__)

# Get the presenter registry
presenter_registry = get_registry()

# Frontend views
@cache_page(60 * 5)  # Cache homepage for 5 minutes to reduce API costs
def index(request):
    """Home page view"""
    return render(request, 'designer/index.html')

@login_required
def plot_editor(request, plot_id=None):
    """Main editor view for lighting plots"""
    try:
        # Get plot presenter from registry
        plot_presenter = presenter_registry.get_plot_presenter()
        
        # Fetch all light fixtures
        fixtures = LightFixture.objects.all()
        # Use presenter to get context data
        context = plot_presenter.get_editor_context(plot_id, request.user)
        
        return render(request, 'designer/editor.html', context)
    except Exception as e:
        logger.error(f"Error in plot_editor view: {e}")
        return render(request, 'designer/error.html', {
            'error_message': "There was an error loading the plot editor. Please try again later."
        }, status=500)

@login_required
def my_plots(request):
    """View for listing user's plots"""
    try:
        # Get plot presenter from registry
        plot_presenter = presenter_registry.get_plot_presenter()
        
        # Use presenter to get user's plots context
        context = plot_presenter.get_user_plots_context(request.user)
        
        # Transform plot objects for better display if needed
        plots = context.get('plots', [])
        formatted_plots = [plot_presenter.format_plot_for_listing(plot) for plot in plots]
        context['plots'] = formatted_plots
        
        return render(request, 'designer/my_plots.html', context)
    except Exception as e:
        logger.error(f"Error in my_plots view: {e}")
        return render(request, 'designer/error.html', {
            'error_message': "There was an error loading your plots. Please try again later."
        }, status=500)

@login_required
def delete_plot(request, plot_id):
    """Delete a light plot"""
    try:
        # Get plot presenter from registry
        plot_presenter = presenter_registry.get_plot_presenter()
        plot_controller = plot_presenter.plot_controller
        
        # Get the plot for this user
        plot = plot_controller.get_plot_by_id(plot_id, request.user)
        if not plot:
            raise Http404("Plot does not exist")
        
        if request.method == 'POST':
            # Use controller to delete the plot
            success = plot_controller.delete_plot(plot_id, request.user)
            
            if success:
                # Clear cache for this user's plots
                cache.delete(f"user_plots_{request.user.id}")
                
                return redirect('designer:my_plots')
            else:
                return render(request, 'designer/error.html', {
                    'error_message': "There was an error deleting the plot. Please try again later."
                }, status=500)
        
        # For GET requests, show confirmation page
        return render(request, 'designer/delete_plot_confirm.html', {'plot': plot})
    except Exception as e:
        logger.error(f"Error in delete_plot view: {e}")
        return render(request, 'designer/error.html', {
            'error_message': "There was an error processing your request. Please try again later."
        }, status=500)

# API Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_plot(request):
    """API endpoint to save a lighting plot"""
    try:
        # Get plot presenter from registry
        plot_presenter = presenter_registry.get_plot_presenter()
        
        # Prepare plot data
        plot_data = {
            'plot_id': request.data.get('plot_id'),
            'title': request.data.get('title', 'Untitled Plot'),
            'stage_id': request.data.get('stage_id'),
            'show_name': request.data.get('show_name', ''),
            'venue': request.data.get('venue', ''),
            'designer': request.data.get('designer', ''),
            'date': request.data.get('date'),
            'addressing_system': request.data.get('addressing_system', 'unified'),
            'plot_data': request.data.get('plot_data', {}),
            'fixtures': request.data.get('fixtures', [])
        }
        
        # Use presenter to handle plot save
        response_data, status_code = plot_presenter.handle_plot_save(plot_data, request.user)
        
        return Response(response_data, status=status_code)
    except Exception as e:
        logger.error(f"Error in save_plot API view: {e}")
        return Response(
            {'success': False, 'error': 'An unexpected error occurred while saving the plot.'},
            status=500
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def load_plot(request, plot_id):
    """API endpoint to load a lighting plot"""
    try:
        # Get plot presenter from registry
        plot_presenter = presenter_registry.get_plot_presenter()
        
        # Get plot data with fixtures using presenter
        plot_data = plot_presenter.get_plot_data(plot_id, request.user)
        if not plot_data:
            raise Http404("Plot does not exist")
        
        return Response(plot_data)
    except Http404:
        raise  # Re-raise 404 errors
    except Exception as e:
        logger.error(f"Error in load_plot API view: {e}")
        return Response(
            {'success': False, 'error': 'An unexpected error occurred while loading the plot.'},
            status=500
        )