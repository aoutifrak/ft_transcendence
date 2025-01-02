from rest_framework import serializers
from chat.models import Message,Chat
from profiles.serializer import UserSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer()
    class Meta:
        model = Message
        fields = ['id', 'chat','sender', 'message', 'updated_at']

