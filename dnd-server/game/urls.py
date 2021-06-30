from game import views
from django.urls import path

urlpatterns = [
    path('canvas/<roomCode>/', views.upload_map_canvas, name="Upload map canvas"),
    path('check/<roomCode>/', views.check_room, name="Check for existing game"),
    path('create/<roomCode>/', views.create_new_game, name="Create new game"),
    path('create_character/<roomCode>/', views.create_character, name="Create new character"),
    path('delete_character/<roomCode>/<characterId>', views.delete_character, name="Delete character"),
    path('get_characters/<roomCode>/', views.get_characters, name="Get all characters for game"),

    path('upload_message/<roomCode>/', views.upload_message, name="Upload chat message"),
    path('get_messages/<roomCode>/', views.get_messages, name="Get chat messages"),
]