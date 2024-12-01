from channels.generic.websocket import AsyncWebsocketConsumer
import json

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.user = self.scope['user']
            self.room_group_name = f'notification_{self.user.id}'
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
        except:
            await self.close()
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
    async def receive(self, text_data):
        self.send(text_data)
    
    
    async def notification_message(self, message ,receiver, type):
        await self.channel_layer.group_send(
            f'notification_{receiver}',
            {
                'type': type,
                'message': message
            }
        )
        
    async def friend_request(self, event):
        sender = event['sender']
        await self.send(text_data=json.dumps({
            'sender': sender,
            'type': 'friend_request',
            'message': f'{sender} sent you a friend request'
        }))