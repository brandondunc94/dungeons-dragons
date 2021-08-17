from game import views
from django.urls import path

urlpatterns = [
    # General game API calls
    path('canvas/<roomCode>/', views.upload_map_canvas, name="Upload map canvas"),
    path('check/<roomCode>/', views.check_room, name="Check for existing game"),
    path('create/<roomCode>/', views.create_new_game, name="Create new game"),
    path('game_metadata/<roomCode>/', views.game_metadata, name="Get game metadata - all fields of a game model"),

    # Character API calls
    path('create_update_character/<roomCode>/<uuid:characterId>/', views.create_update_character, name="Update single character"),
    path('create_update_character/<roomCode>/', views.create_update_character, name="Create new single character"),
    path('update_characters/<roomCode>/', views.update_characters, name="Update list of characters"),
    path('delete_character/<roomCode>/<characterId>', views.delete_character, name="Delete character"),
    path('get_characters/<roomCode>/', views.get_characters, name="Get all characters for game"),

    # Live chat API calls
    path('upload_message/<roomCode>/', views.upload_message, name="Upload chat message"),
    path('get_messages/<roomCode>/', views.get_messages, name="Get chat messages"),

    # Combat API calls
    path('toggle_combat/<roomCode>/<combatFlag>/', views.toggle_combat, name="Switch combat flag"),
    path('change_combat_turn/<roomCode>/<int:combatTurn>/', views.change_combat_turn, name="Change combat turn"),
]