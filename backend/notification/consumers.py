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
        await self.send(text_data=json.dumps({
            'sender': sender,
            'type': 'friend_request',
            'message': f'{sender['username']} sent you a friend request'
        }))

    async def reject_request(self, event):
        sender = event['sender']
        
        await self.send(text_data=json.dumps({
            'sender': sender,
            'type': 'reject_request',
            'message': f'{sender['username']} reject your friend request'
        }))

    async def unfriend(self, event):
        sender = event['sender']
        
        await self.send(text_data=json.dumps({
            'sender': sender,
            'type': 'unfriend',
            'message': f'{sender['username']} unfriend your'
        }))

    async def accept_request(self, event):
        sender = event['sender']
        await self.send(text_data=json.dumps({
            'sender': sender,
            'type': 'accept_request',
            'message': f'{sender['username']} accept your friend request'
        }))

    async def block_request(self, event):
        sender = event['sender']
        await self.send(text_data=json.dumps({
            'sender': sender,
            'type': 'block_request',
            'message': f'{sender['username']} blocked you'
        }))

    async def unblock_request(self, event):
        sender = event['sender']
        await self.send(text_data=json.dumps({
            'sender': sender,
            'type': 'unblock_request',
            'message': f'{sender['username']} unblocked you'
        })
        )
     
    async def accept_invite(self, event):
        sender = event['sender']
        game_id = event['game_id']
        await self.send(text_data=json.dumps({
            'sender': sender,
            'type': 'accept_invite',
            'message': f'{sender['username']} Accept you a Game request',
            'game_id': game_id
            })
        )

    async def game_invite(self, event):
        sender = event['sender']
        game_id = event['game_id']
        await self.send(text_data=json.dumps({
            'sender': sender,
            'type': 'game_invite',
            'message': f'{sender['username']} sent you a Game request',
            'game_id': game_id
        }))

    async def reject_game(self, event):
        sender = event['sender']
        await self.send(text_data=json.dumps({
            'sender': sender,
            'type': 'reject_game',
            'message': f'{sender['username']} reject your Game request'
        }))

    async def sent_message(self, event):
        sender = event['sender']
        await self.send(text_data=json.dumps(
            {
                'sender': sender,
                'type': 'sent_message',
                'message': f'{sender['username']} send you a message'
            }
        ))
    async def invite_tournemet(self, event):
        sender = event['sender']
        await self.send(text_data=json.dumps({
            'sender': sender,
            'type': 'invite_tournemet',
            'message': f'{sender['username']} sent your Local tournement request'
        }))