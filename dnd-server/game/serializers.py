from rest_framework import serializers
from rest_framework.fields import UUIDField
from .models import Character, Game, Message

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = '__all__'

class CharacterSerializer(serializers.ModelSerializer):
    # The game object and uuid will be set by the backend and are not expected 
    # from the frontend call when creating or updating a new character
    game_id = serializers.CharField(required=False)
    id = UUIDField() # Convert id string to UUID value
    
    class Meta:
        model = Character
        # Note - The only field we are not including is the 'game' field since that is a game object
        # instead we are using a custom field game_id to reference that object
        fields = ('game_id', 'id', 'name', 'health', 'maxHealth', 'position', 'type', 'characterClass', 'combatTurn')
    
    def create(self, validated_data):
        game_id = validated_data.pop('game_id') # Get game_id field from serializer and use to lookup game object
        gameObject = Game.objects.get(roomCode=game_id)
        newCharacter = Character.objects.create(game=gameObject, **validated_data)
        return newCharacter

class CharacterListSerializer(serializers.ListSerializer):
    child = CharacterSerializer()
    
    def update(self, allCharacters, validated_data):
        # Maps for id->instance and id->data item.
        character_mapping = {character.id: character for character in allCharacters}
        data_mapping = {item['id']: item for item in validated_data}

        # Perform creations and updates.
        ret = []
        for character_id, data in data_mapping.items():
            character = character_mapping.get(character_id, None)
            if character is None:
                ret.append(self.child.create(data))
            else:
                ret.append(self.child.update(character, data))

        # Perform deletions. I don't think we need this but I am keeping it here for future reference just in case
        # for character_id, character in character_mapping.items():
        #     if character_id not in data_mapping:
        #         character.delete()

        return ret 

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