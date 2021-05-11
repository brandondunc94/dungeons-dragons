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
        response = json.loads(text_data)

        payloadType = response.get('type', None)
        print(payloadType)
        # messageAuthor = response.get("author", None)
        # message = response.get("message", None)
        # messageDateTime = response.get("dateTime", None)
        #print('Received new message - ' + messageAuthor + ':' + message)
        #Send message to room group
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'send_data',
            'roomData': response
            #'message': message,
            #'dateTime': messageDateTime
        })

    async def send_data(self, res):
        # Send message to WebSocket
        print(res)
        await self.send(text_data=json.dumps({
            "payload": res,
        }))
