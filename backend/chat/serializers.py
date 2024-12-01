#import serializers
from rest_framework import serializers
from chat.models import Message , Chat

from django.db.models import Q


class MessageSerializer(serializers.ModelSerializer):
    sender_user = serializers.CharField(source='sender.username', read_only=True)
    receiver_user = serializers.CharField(source='receiver.username', read_only=True)
    class Meta:
        model = Message
        fields = ['id', 'chat', 'receiver_user' , 'sender_user', 'message', 'updated_at']

        
class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = '__all__'
