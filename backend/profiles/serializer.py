from rest_framework import serializers 
from .models import User , FriendRequest
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from rest_framework.exceptions import AuthenticationFailed
import requests ,random
from django.core.exceptions import ValidationError


class User_Register(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=55, min_length=8, allow_blank=False)
    password = serializers.CharField(max_length=68,min_length=6,write_only=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'username', 'password', 'avatar']

    def create(self, validated_data):
        password = validated_data.get('password', None)
        username = validated_data.get('username`', None)

        if len(password) < 8:
            raise ValidationError("Password must be at least 8 characters long.")
        if len(password) > 50:
            raise ValidationError("Password cannot exceed 50 characters.")

        if not username or username == '' or User.objects.filter(username=username).exists():
            if User.objects.filter(username=validated_data['email'].split('@')[0]).exists():
                while User.objects.filter(username=validated_data['username']).exists():
                    validated_data['username'] = validated_data['email'].split('@')[0] + str(random.randint(0,999))
            else:
                validated_data['username'] = validated_data['email'].split('@')[0]
            
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    avatar = serializers.ImageField(allow_empty_file=True, required=False) 
    class Meta:
        model = User
        fields = [
                  'email',
                  'first_name',
                  'last_name',
                  'username',
                  'avatar',
                  'bio',
                  'created_at',
                  'last_login',
                  'wins',
                  'losses',
                  'draws',
                  'matches_played',
                  'is2fa',
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
        elif platform == "gmail":
            response = requests.get('https://www.googleapis.com/oauth2/v3/userinfo',headers=headers, timeout=10000)
            response.raise_for_status()
            res = response.json()
            email = res['email']
            user , created = User.objects.get_or_create(email=email)
            if created:
                res['first_name']= res['given_name']
                res['last_name']= res['given_name']
                res['password'] = random.randint(10000000,99999999)
                user = User_Register(data=res)
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
    class Meta:
        model = FriendRequest
        fields = '__all__'

class FriendSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
        'id',
        'username',
        'first_name',
        'last_name',
        'is_online'
        ]
