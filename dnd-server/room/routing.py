from django.urls import re_path

from room.consumers import RoomConsumer

websocket_urlpatterns = [
    #re_path(r'^ws/play/(?P<room_code>[^/]+)/$', RoomConsumer.as_asgi()),
    re_path('ws/play/(?P<room_code>)', RoomConsumer.as_asgi()),
]