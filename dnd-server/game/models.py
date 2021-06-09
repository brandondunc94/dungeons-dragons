from django.db import models
from django.contrib import admin
from .storage import OverwriteStorage

class Game(models.Model):
    roomCode = models.CharField(primary_key=True, max_length=10, default='')
    backgroundCanvas = models.ImageField(null=True, blank=True, storage=OverwriteStorage(), upload_to='images/', help_text='Latest Map Canvas')

admin.site.register(Game)