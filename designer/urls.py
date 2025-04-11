from django.urls import path
from . import views

app_name = 'designer'

urlpatterns = [
    path('', views.index, name='index'),
    path('plots/', views.my_plots, name='my_plots'),
    path('editor/', views.plot_editor, name='new_plot'),
    path('editor/<int:plot_id>/', views.plot_editor, name='edit_plot'),
]