from rest_framework import serializers
from .models import Character, Game, Message

class CharacterSerializer(serializers.ModelSerializer):
    game_id = serializers.CharField()
    class Meta:
        model = Character
        read_only_fields = ('id',)
        fields = ('game_id', 'id', 'name', 'health', 'maxHealth', 'position', 'type', 'characterClass')
    
    def create(self, validated_data):
        game_id = validated_data.pop('game_id') # Get game_id field from serializer and use to lookup game object
        gameObject = Game.objects.get(roomCode=game_id)
        newCharacter = Character.objects.create(game=gameObject, **validated_data)
        return newCharacter
    
    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.health = validated_data.get('health', instance.health)
        instance.maxHealth = validated_data.get('maxHealth', instance.maxHealth)
        instance.position = validated_data.get('position', instance.position)
        instance.type = validated_data.get('type', instance.type)
        instance.characterClass = validated_data.get('characterClass', instance.characterClass)
        instance.save()
        return instance

class MessageSerializer(serializers.ModelSerializer):
    game_id = serializers.CharField()
    class Meta:
        model = Message
        fields = ('game_id', 'author', 'messageText', 'messageDateTime')
    
    def create(self, validated_data):
        game_id = validated_data.pop('game_id') # Get game_id field from serializer and use to lookup game object
        gameObject = Game.objects.get(roomCode=game_id)
        newMessage = Message.objects.create(game=gameObject, **validated_data)
        return newMessage