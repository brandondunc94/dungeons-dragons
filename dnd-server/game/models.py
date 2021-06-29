from django.db import models
from django.contrib import admin
from django.db.models.fields import CharField
from .storage import OverwriteStorage
import uuid

class Game(models.Model):
    roomCode = models.CharField(primary_key=True, max_length=10, default='')
    backgroundCanvas = models.ImageField(null=True, blank=True, storage=OverwriteStorage(), upload_to='images/', help_text='Latest Map Canvas')
admin.site.register(Game)

class Character(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=30)
    health = models.IntegerField()
    maxHealth = models.IntegerField()
    position = models.IntegerField(default=0)
    type = models.CharField(max_length=30)
    characterClass = models.CharField(max_length=30)
admin.site.register(Character)
