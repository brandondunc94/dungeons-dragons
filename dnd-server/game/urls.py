from game import views
from django.urls import path

urlpatterns = [
    path('canvas/<roomCode>/', views.upload_map_canvas, name="Upload map canvas"),
    path('check/<roomCode>/', views.check_room, name="Check for existing game"),
    path('create/<roomCode>/', views.create_new_game, name="Create new game"),
]