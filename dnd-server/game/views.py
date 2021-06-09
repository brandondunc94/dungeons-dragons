import json
from django.shortcuts import render
from django.http import JsonResponse
from .models import Game
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def upload_map_canvas(request, roomCode=1):
    if(request.method == 'POST'):
        myFile = request.FILES['fileKey']
        myFile.name = roomCode + '.png'
        game = Game.objects.get(roomCode=roomCode)
        game.backgroundCanvas =  myFile
        game.save()
        data = {
            'status': 'SUCCESS',
        }
        
        return JsonResponse(data)
