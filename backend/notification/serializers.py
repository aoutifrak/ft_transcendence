#import serializers
from .models import Notification
from profiles.serializer import UserSerializer
from rest_framework import serializers 

class Notification_serializer(serializers.ModelSerializer):
    sender_notif =  UserSerializer()
    class Meta:
        model = Notification
        fields = '__all__'
        