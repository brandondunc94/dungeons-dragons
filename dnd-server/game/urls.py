from game import views
from django.urls import path

urlpatterns = [
    path('canvas/<roomCode>/', views.upload_map_canvas, name="Upload map canvas"),
]