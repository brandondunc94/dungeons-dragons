import json
from django.shortcuts import render
from django.http import JsonResponse
from .models import Game
from django.views.decorators.csrf import csrf_exempt

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
