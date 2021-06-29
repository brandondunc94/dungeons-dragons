from rest_framework import serializers
from .models import Character, Game

class CharacterSerializer(serializers.ModelSerializer):
    game_id = serializers.CharField()
    class Meta:
        model = Character
        fields = ('game_id', 'id', 'name', 'health', 'maxHealth', 'position', 'type', 'characterClass')
    
    def create(self, validated_data):
        game_id = validated_data.pop('game_id') # Get game_id field from serializer and use to lookup game object
        gameObject = Game.objects.get(roomCode=game_id)
        newCharacter = Character.objects.create(game=gameObject, **validated_data)
        return newCharacter
    