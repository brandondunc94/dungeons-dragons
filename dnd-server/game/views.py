import json
from typing import cast
from django.shortcuts import render
from django.http import JsonResponse
from .models import Game
from django.views.decorators.csrf import csrf_exempt

from rest_framework.decorators import api_view
from rest_framework.response import Response

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