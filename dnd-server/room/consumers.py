import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
        
class RoomConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = 'room_%s' % self.room_name
        
        print(self.room_name)
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        print("Disconnected")
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'send_update',
            #'message': message,
            #'dateTime': messageDateTime
        })

    async def send_update(self, res):
        # Send update to WebSocket
        print(res)
        await self.send(text_data=json.dumps({
            "payload": res,
        }))
