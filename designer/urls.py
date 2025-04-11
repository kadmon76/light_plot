from django.urls import path
from . import views

app_name = 'designer'

urlpatterns = [
    # Frontend routes
    path('', views.index, name='index'),
    path('plots/', views.my_plots, name='my_plots'),
    path('editor/', views.plot_editor, name='new_plot'),
    path('editor/<int:plot_id>/', views.plot_editor, name='edit_plot'),
    path('delete-plot/<int:plot_id>/', views.delete_plot, name='delete_plot'),
    
    # API routes
    path('api/plot/save/', views.save_plot, name='save_plot'),
    path('api/plot/<int:plot_id>/', views.load_plot, name='load_plot'),
]