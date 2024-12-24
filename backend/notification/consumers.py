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
    
        
    async def friend_request(self, event):
        sender = event['sender']
        username = sender['username']
        await self.send(text_data=json.dumps({
            'sender': sender,
            'type': 'friend_request',
            'message': f'{username} sent you a friend request'
        }))

    async def reject_request(self, event):
        sender = event['sender']
        await self.send(text_data=json.dumps({
            'sender': sender,
            'type': 'reject_request',
            'message': f'{sender} reject your friend request'
        }))

    async def accept_request(self, event):
        sender = event['sender']
        await self.send(text_data=json.dumps({
            'sender': sender,
            'type': 'accept_request',
            'message': f'{sender} accept your friend request'
        }))

    async def block_request(self, event):
        sender = event['sender']
        await self.send(text_data=json.dumps({
            'sender': sender,
            'type': 'block_request',
            'message': f'{sender} blocked you'
        }))

    async def unblock_request(self, event):
        sender = event['sender']
        await self.send(text_data=json.dumps({
            'sender': sender,
            'type': 'unblock_request',
            'message': f'{sender} blocked you'
        }))
    
    async def accept_invite(self, event):
        sender = event['sender']
        await self.send(text_data=json.dumps({
            'sender': sender,
            'type': 'accept_invite',
            'message': f'{sender} Accept you a Game request'
            }
        )
        )

    async def game_invite(self, event):
        sender = event['sender']
        await self.send(text_data=json.dumps({
            'sender': sender,
            'type': 'game_invite',
            'message': f'{sender} sent you a Game request'
        }))

    async def sent_message(self, receiver, sender):
        await self.channel_layer.group_send(
            f'notification_{receiver}',
            {
                'sender': sender,
                'type': 'sent_message',
                'message': f'{sender} send you a message'
            }
        )