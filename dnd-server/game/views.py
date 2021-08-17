from typing import cast
from django.shortcuts import render
from django.http import JsonResponse
from .models import Game, Character, Message
from .serializers import CharacterSerializer, CharacterListSerializer, MessageSerializer, GameSerializer
from django.views.decorators.csrf import csrf_exempt

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.parsers import JSONParser

@csrf_exempt
def upload_map_canvas(request, roomCode=1):
    if(request.method == 'POST'):
        myFile = request.FILES['canvasImageKey']
        myFile.name = roomCode + '.png' #Image name will be the roomCode + .png (Ex. 15.png)
        game = Game.objects.get(roomCode=roomCode) #Retrieve game the matches the room code
        game.backgroundCanvas =  myFile
        game.save()
        data = {
            'status': 'SUCCESS',
        }
        
        return JsonResponse(data)

@api_view(['GET'])
def check_room(request, roomCode):
    try:
        Game.objects.get(roomCode=roomCode)
        status='EXISTING' #If game object is found for room code passed in, return EXISTING
    except:
        status='NEW'
    print('Room code requested: ' + roomCode)
    data = {
        'status': status
    }
    return Response(data)

@api_view(['GET'])
def game_metadata(request, roomCode):
    try:
        game = Game.objects.get(roomCode=roomCode)
        gamePayload = GameSerializer(game)
        status='SUCCESS'
    except:
        status='FAILED'
    data = {
        'status': status,
        'game': gamePayload.data # Pass game object as JSON in response
    }
    return Response(data)

@api_view(['GET'])
def create_new_game(request, roomCode):
    try:
        print('Creating new game using room code: ' + roomCode)
        newGame = Game.objects.create( # Create new game object using room code passed in
            roomCode = roomCode
        )
        newGame.save()
        status = 'SUCCESS'
    except:
        status = 'FAILED'
    data = {
        'status': status
    }
    return Response(data)

@api_view(['GET'])
def get_characters(request, roomCode):
    try:
        print('Getting characters for room: ' + roomCode)
        characters = Character.objects.filter(game_id=roomCode).order_by('combatTurn')
        charactersPayload = CharacterSerializer(characters, many=True)
        status = 'SUCCESS'
    except:
        status = 'FAILED'
        charactersPayload = ''
    data = {
        'status': status,
        'characters': charactersPayload.data
    }
    return Response(data)

@api_view(['POST'])
def create_update_character(request, roomCode, characterId=''): # Create or update a single character - uses CharacterSerializer
    try:
        serializer = CharacterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                character = Character.objects.get(id=characterId)
                serializer.update(character, serializer.validated_data)
            except:
                serializer.create(serializer.validated_data)
            status = 'SUCCESS'
        else:
            status = 'FAILED' #Not all fields sent - unable to create character
    except:
        status = 'FAILED' #Error while trying to create new character - room code is likely invalid
    data = {
        'status': status
    }
    return Response(data)

@api_view(['POST'])
def update_characters(request, roomCode): # Update multiple characters - uses CharacterListSerializer
    try:
        gameCharacters = Character.objects.filter(game_id=roomCode)
        serializer = CharacterListSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.update(gameCharacters, serializer.validated_data)
                status = 'SUCCESS'
            except:
                status = 'FAILED'
        else:
            status = 'FAILED' # Not all required fields sent - unable to update characters
    except:
        status = 'FAILED' # Error while trying to update characters - room code is likely invalid
    data = {
        'status': status
    }
    return Response(data)

@api_view(['GET'])
def delete_character(request, roomCode, characterId):
    try:
        #Get character model and delete it
        character = Character.objects.get(id=characterId)
        print('Deleting character ' + str(character.id) + ' ' + character.name + ' from room ' + roomCode)
        character.delete()
        status = 'SUCCESS'
    except:
        status = 'FAILED' #Error while trying to delete character - character ID is invalid
    data = {
        'status': status
    }
    return Response(data)

@api_view(['POST'])
def upload_message(request, roomCode):
    print('Uploading new message for room: ' + roomCode)
    try:
        data = JSONParser().parse(request)
        serializer = MessageSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            status = 'SUCCESS'
        else:
            status = 'FAILED' #Not all fields sent - unable to create new message
    except:
        status = 'FAILED' #Error while trying to create new message - room code might be invalid
    data = {
        'status': status
    }
    return Response(data)

@api_view(['GET'])
def get_messages(request, roomCode):
    try:
        print('Getting messages for room: ' + roomCode)
        messages = Message.objects.filter(game_id=roomCode)
        messagePayload = MessageSerializer(messages, many=True)
        status = 'SUCCESS'
    except:
        status = 'FAILED'
        messagePayload = ''
    data = {
        'status': status,
        'messages': messagePayload.data
    }
    return Response(data)

@api_view(['GET'])
def toggle_combat(request, roomCode, combatFlag):
    try:
        game = Game.objects.get(roomCode=roomCode)
        if combatFlag == 'true':
            game.inCombat = True
            game.combatTurn = 0 # Reset combat turn to first character
        else:
            game.inCombat = False
        game.save()
        status = 'SUCCESS'
    except:
        status = 'FAILED'
        
    data = {
        'status': status
    }
    return Response(data)

@api_view(['GET'])
def change_combat_turn(request, roomCode, combatTurn): # combatTurn is either the index of the current character who's turn it is
    try:
        game = Game.objects.get(roomCode=roomCode)
        game.combatTurn = combatTurn
        game.save()
        status = 'SUCCESS'
    except:
        status = 'FAILED'
        
    data = {
        'status': status
    }
    return Response(data)