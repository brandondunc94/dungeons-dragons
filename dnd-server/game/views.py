from typing import cast
from django.shortcuts import render
from django.http import JsonResponse
from .models import Game, Character
from .serializers import CharacterSerializer
from django.views.decorators.csrf import csrf_exempt

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework import status

from game import serializers

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
        status='EXISTING' #If game object is found for room code passed in, return true
    except:
        status='NEW'
    print('Room code requested: ' + roomCode)
    data = {
        'status': status
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
        characters = Character.objects.filter(game_id=roomCode)
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
def create_character(request, roomCode):
    print('Creating new character for room: ' + roomCode)
    try:
        data = JSONParser().parse(request)
        serializer = CharacterSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            status = 'SUCCESS'
        else:
            status = 'FAILED' #Not all fields sent - unable to create character
    except:
        status = 'FAILED' #Error while trying to create new character - room code might be invalid
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

