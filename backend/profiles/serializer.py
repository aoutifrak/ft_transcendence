from rest_framework import serializers 
from .models import User , FriendRequest
from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
import requests ,random
from django.core.exceptions import ValidationError
from django.conf import settings
from django.db.models import Q


def generate_unique_username(email):
    base_username = email.split('@')[0]
    username = base_username

    counter = 0
    while User.objects.filter(username=username).exists():
        counter += 1
        username = f"{base_username}{random.randint(1000, 9999)}"
        if counter > 100: 
            raise ValueError("Unable to generate a unique username")
    return username

class User_Register(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=55, min_length=8, allow_blank=False)
    password = serializers.CharField(max_length=68,min_length=8,write_only=True)
    username = serializers.CharField(max_length=20, min_length=4, allow_blank=False)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'username', 'password']


    def create(self, validated_data):
        password = validated_data.get('password')
        username = validated_data.get('username')

        if len(password) < 8:
            raise ValidationError("Password must be at least 8 characters long.")
        if len(password) > 68:
            raise ValidationError("Password cannot exceed 50 characters.")

        if User.objects.filter(username=username).exists():
            username = generate_unique_username(validated_data['email'])
        
        validated_data['username'] = username
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user
    
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    avatar = serializers.ImageField(required=False)
    class Meta:
        model = User
        fields = [
                  'email',
                  'first_name',
                  'last_name',
                  'username',
                  'password',
                  'avatar',
                  'created_at',
                  'last_login',
                  'wins',
                  'league_wins',
                  'losses',
                  'league_losses',
                  'last_game',
                  'level',
                  'matches_played',
                  'is2fa',
                  'is_online',
                  'rank',
                  'score',
                  'medal',
                  ]
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password',None)
        user = super().update(instance,validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class LoginUserSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=55, min_length=8, allow_blank=False,required=True)
    password = serializers.CharField(max_length=68,min_length=8,write_only=True,required=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        try:
            user = User.objects.get(email=email)
        except:
            raise AuthenticationFailed("invalid credentials try again")
        
        if not user.check_password(raw_password=password):
            raise AuthenticationFailed('User not Found or password incorrect')
        user.is_online = True
        user.save()
        return user

class SocialAuthontication(serializers.Serializer):
    serializer_class = User_Register
    def validate(self, data):
        data = self.initial_data
        access_token = data['access_token']
        platform = data['platform']
        headers = {'Authorization':f'Bearer {access_token}'}
        if platform == "42":
            response = requests.get('https://api.intra.42.fr/v2/me',headers=headers, timeout=10000)
            response.raise_for_status()
            res = response.json()
            email = res['email']
            try:
                user = User.objects.get(email=email)
                return user.email
            except :
                try:
                    validated_data = {}
                    validated_data['username'] = res['login']
                    if User.objects.filter(username=validated_data['username']).exists():
                        validated_data['username'] = generate_unique_username(email)
                    validated_data['username'] = generate_unique_username(email)
                    validated_data['email'] = email
                    validated_data['first_name'] = res['first_name']
                    validated_data['last_name'] = res['last_name']
                    user = User.objects.create_user(**validated_data)
                    user.set_password(str(random.randint(10000000,99999999)))
                    user.save()
                    return user.email
                except Exception as e:
                    raise serializers.ValidationError('Failed to login with given credentials')
        else:
            raise serializers.ValidationError('Failed to login with given credentials')
        raise serializers.ValidationError('Failed to login with given credentials')

class ByUserSerializer(serializers.ModelSerializer):
    is_blocked = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = [
                  'email',
                  'first_name',
                  'last_name',
                  'username',
                  'avatar',
                  'created_at',
                  'last_login',
                  'wins',
                  'losses',
                  'level',
                  'matches_played',
                  'is2fa',
                  'is_online',
                  'rank',
                  'on_game',
                  'is_online',
                  'is_blocked',
                  ]

    def get_is_blocked(self,obj):
        request_user = self.context['request'].user
        return request_user.blocked.filter(id=obj.id).exists()
    
    def get_avatar(self, obj):
        return obj.avatar.url.replace(settings.MEDIA_URL, '/media/')

class FriendSerializer(serializers.ModelSerializer):
    is_friend = serializers.SerializerMethodField()
    is_blocked = serializers.SerializerMethodField()
    is_friend_req = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = [
                  'first_name',
                  'last_name',
                  'username',
                  'avatar',
                  'is_online',
                  'is_blocked',
                  'is_friend',
                  'is_friend_req',
                  ]
    
    def get_is_friend(self,obj):
        request_user = self.context['request'].user
        return request_user.friends.filter(id=obj.id).exists()

    def get_is_blocked(self,obj):
        request_user = self.context['request'].user
        return request_user.blocked.filter(id=obj.id).exists()

    def get_avatar(self, obj):
        return obj.avatar.url.replace(settings.MEDIA_URL, '/media/')
    def get_is_friend_req(self, obj):
        request_user = self.context['request'].user
        user = obj
        if FriendRequest.objects.filter(Q(from_user=request_user) & Q(to_user=user) & Q(status=0)).exists():
            return 'sent'
        if FriendRequest.objects.filter(Q(from_user=user) & Q(to_user=request_user) & Q(status=0)).exists():
            return 'received'
        else:    
            return False


class FriendRequestSerializer(serializers.ModelSerializer):
    from_user =  ByUserSerializer()
    to_user =  ByUserSerializer()
    type = serializers.SerializerMethodField()

    class Meta:
        model = FriendRequest
        fields = ['from_user', 'to_user' ,'status', 'created_at','type']

    def get_type(self, obj):
        request_user = self.context['request'].user
        if request_user ==  obj.from_user:
            return 'sent'
        return 'received'

    def to_representation(self, instance):

        representation = super().to_representation(instance)

        if representation['type'] == 'sent':
            representation['user'] = representation.pop('to_user')
            representation.pop('from_user', None)
        else:
            representation['user'] = representation.pop('from_user')
            representation.pop('to_user', None)

        return representation