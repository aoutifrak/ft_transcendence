from rest_framework import serializers 
from .models import User , FriendRequest, Matches
from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
import requests ,random
from django.core.exceptions import ValidationError


class User_Register(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=55, min_length=8, allow_blank=False)
    password = serializers.CharField(max_length=68,min_length=6,write_only=True)
    username = serializers.CharField(max_length=20, min_length=4, allow_blank=False)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'username', 'password', 'avatar']

    def create(self, validated_data):
        password = validated_data.get('password', None)
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
                  'losses',
                  'level',
                  'matches_played',
                  'is2fa',
                  'is_online',
                  'rank',
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
        if platform == "github":
            response = requests.get('https://api.github.com/user/emails',headers=headers, timeout=10000)
            response.raise_for_status()
            res = response.json()
            email = None
            for fileds in res:
                if fileds['primary'] == True:
                    email = fileds['email']
                    break
            if email is None:
                raise serializers.ValidationError('email is required')
            user , created = User.objects.get_or_create(email=email)
            if created:
                userinfo = requests.get('https://api.github.com/user',headers=headers, timeout=10000)
                userinfo.raise_for_status()
                userinfo['password'] = random.randint(10000000,99999999)
                user = User_Register(data=userinfo.json())
                user.is_valid(raise_exception=True)
                return user.data['email']
            return user.email
            if email is None:
                raise serializers.ValidationError('email is required')
        elif platform == "42":
            response = requests.get('https://api.intra.42.fr/v2/me',headers=headers, timeout=10000)
            response.raise_for_status()
            res = response.json()
            email = res['email']
            user , created = User.objects.get_or_create(email=email)
            if created:
                res['password'] = random.randint(10000000,99999999)
                user = User_Register(data=res)
                user.is_valid(raise_exception=True)
                return user.data['email']
            return user.email
        raise serializers.ValidationError('Failed to login with given credentials')

class FriendRequestSerializer(serializers.ModelSerializer):
    from_user =  serializers.CharField(source='from_user.username', read_only=True)
    to_user =  serializers.CharField(source='to_user.username', read_only=True)
    class Meta:
        model = FriendRequest
        fields = '__all__'

class Machserializer(serializers.ModelSerializer):
    userone =  serializers.CharField(source='userone.username', read_only=True)
    usertow =  serializers.CharField(source='usertow.username', read_only=True)
    winner =  serializers.CharField(source='winner.username', read_only=True)
    class Meta:
        model = Matches
        fields = '__all__'

class FriendSerializer(serializers.ModelSerializer):
    is_friend = serializers.SerializerMethodField()
    is_blocked = serializers.SerializerMethodField()
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
                  ]
    

    def get_is_friend(self,obj):
        request_user = self.context['request'].user
        return request_user.friends.filter(id=obj.id).exists()

    def get_is_blocked(self,obj):
        request_user = self.context['request'].user
        return request_user.blocked.filter(id=obj.id).exists()

