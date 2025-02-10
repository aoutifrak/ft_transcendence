from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from chat.models import Chat , Message
from chat.serializers import MessageSerializer
from django.db.models import Q
from notification.consumers import NotificationConsumer
from profiles.serializer import UserSerializer

User = get_user_model()

@database_sync_to_async
def get_messages(chat,user,receiver,message):
    try:
        messages = Message.objects.create(chat=chat,sender=user,receiver=receiver,message=message)
        messages.save()
        return messages
    except Exception as e:
        return None

@database_sync_to_async
def get_chat_room(user1, user2):
    try :
        chat_room = Chat.objects.get(Q(user1=user1,user2=user2) | Q(user1=user2,user2=user1))
        return chat_room
    except:
        try:
            chat_room = Chat.objects.create(user1=user1,user2=user2)
            chat_room.save()
            return chat_room
        except:
            return None

@database_sync_to_async
def get_user(username):
    try:
        user = User.objects.get(username=username)
        return user
    except User.DoesNotExist:
        return None

@database_sync_to_async
def check_friendship(user1,user2):
    try:
        user1.friends.get(id=user2.id)
        return True
    except:
        return False

@database_sync_to_async
def check_blocked(user1,user2):
    try:
        user1.blocked.get(id=user2.id)
        return True
    except:
        return False

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.room_name = self.scope['user'].id
            self.room_group_name = f"chat_{self.room_name}"
            await self.channel_layer.group_add(self.room_group_name,self.channel_name)
            await self.accept()
        except Exception as e:
            await self.close()

    async def disconnect(self,close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            receiver = text_data_json['receiver']
            message = text_data_json['message']
            user = await get_user(receiver)
            
            if user is None:
                raise User.DoesNotExist("User not Found")
            
            if user == self.scope['user']:
                raise Exception("You can't send message to yourself")
            
            if await check_friendship(user, self.scope['user']) == False:
                raise Exception("You are not friend with this user")

            if await check_blocked(self.scope['user'],user) == True:
                raise Exception("Can't send message to this blocked user")
            
            if await check_blocked(user, self.scope['user']) == True:
                raise Exception("Can't send message this user blocked you")
            
            chat_room = await get_chat_room(user1=self.scope['user'], user2=user)
            if chat_room is None:
                raise Exception("could not create chat room")
            
            messages = await get_messages(chat=chat_room, user=self.scope['user'],receiver=user, message=message)

            if messages is None:
                raise Exception("could not create chat Message")
            
            messages = MessageSerializer(messages).data
            
            sender = UserSerializer(self.scope['user']).data

            await self.channel_layer.group_send(
                f'notification_{user.id}',
                {
                    'type': 'sent.message',
                    'sender': sender,
                    'message': messages
                }
            )

            await self.channel_layer.group_send(
                f'chat_{user.id}',
                {
                    'type': 'chat.message',
                    'message': messages
                }
            )
            
        except Exception as e:
            await self.send(text_data=json.dumps({
            'type': 'error',
            'message': str(e)
        }))
    
    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))
    