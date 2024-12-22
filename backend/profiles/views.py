from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from .serializer import UserSerializer , LoginUserSerializer ,User_Register , SocialAuthontication ,FriendRequestSerializer ,Machserializer ,FriendSerializer
from .models import User , FriendRequest, Matches 
import jwt 
from django.core.serializers import deserialize
from django.conf import settings
import json
from rest_framework.permissions import IsAuthenticated ,AllowAny
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken ,AccessToken
import pyotp
from django.db.models import Q
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import os , requests

class RefreshTokenView(APIView):
    permission_classes = [AllowAny]
    def post(self,request):
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            if not refresh_token:
                return Response({"error": "Refresh token not provided"}, status=400)
    
            refresh_token = RefreshToken(refresh_token)
            
            return Response({'access_token':str(refresh_token.access_token)}, status=200)
        except Exception as e:
            return Response({'info':str(e)},status=400)

class verifyToken(APIView):
    permission_classes = [AllowAny]
    def post(self,request):
        try:
            token = request.data.get('token')
            AccessToken(token)
            return Response({'valid':True},status=200)
        except:
            return Response({'valid':False},status=400)

class LoginView(APIView):
    permission_classes = [AllowAny]
    serializer_class = LoginUserSerializer
    def post(self, request):
        data = self.serializer_class(data=request.data)
        try:
            if data.is_valid(raise_exception=True):
                user = data.validated_data
                if user.is2fa:
                    return Response(
                    {
                    '2fa':True,
                    'email':user.email
                    })
                token = user.token()
                response = Response({
                    'access': str(token.access_token)
                },status=status.HTTP_200_OK)
                response.set_cookie(
                    key='refresh_token',
                    value=token,
                    httponly=True,
                )
                return response
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class Sign_upView(APIView):
    permission_classes = [AllowAny]
    def post(self,request):
        try:
            email = request.data.get('email', None)
            username = request.data.get('username', None)
            if User.objects.filter(email=email).exists():
                raise AuthenticationFailed('Email already exists')
            if User.objects.filter(username=username).exists():
                raise AuthenticationFailed('Username already exists')
            serialaizer = User_Register(data=request.data)
            if serialaizer.is_valid(raise_exception=True):
                user = serialaizer.save()
                return Response(
                    {
                        'detail': 'Registration successful.'
                    },status=status.HTTP_201_CREATED
                )
        except Exception as e:
                return Response(
                    {str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

class Get_user_info(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get(self,request):
        try:
            user = request.user
            serialized_user = self.serializer_class(user)
            return Response(serialized_user.data)
        except Exception as e:
            return Response({'info':str(e)},status=400)

class UserUpdate(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def put(self, request):
        try:
            user = request.user
            infos = request.data
            avatar = infos.get('avatar',None)
            valid_keys = ['first_name','last_name','avatar']
            for key in infos.keys():
                if key not in valid_keys:
                    return Response({"error": f"invalid fileds {key}!"},status=status.HTTP_400_BAD_REQUEST)
            if avatar is not None:
                max_size_mb = 2
                if avatar.size > max_size_mb * 1024 * 1024:
                    return Response({"error": f"File size exceeds {max_size_mb}MB limit"}, status=HTTP_400_BAD_REQUEST)
                avatar_extension = os.path.splitext(avatar.name)[1]
                avatar.name = f"{user.username}{avatar_extension}"
                request.data['avatar'] = avatar
            serializer = self.serializer_class(user,data=request.data,partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "User updated successfully!"},status=status.HTTP_200_OK)
            return Response({"message": "User not updated successfully!"},status=HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            refresh = request.COOKIES.get('refresh_token',None)
            if refresh is not None:
                print(refresh)
                token = RefreshToken(refresh)
                token.blacklist()
                response = Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
                response.delete_cookie('refresh_token')
                return response
            response = Response({"detail": "Not logedin yet."}, status=status.HTTP_400_BAD_REQUEST)
            return response
        except TokenError:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

class Control2Fa(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request):
        try:
            user = request.user
            if user:
                user.pyotp_secret = pyotp.random_base32()
                otp = pyotp.TOTP(user.pyotp_secret).provisioning_uri(user.email, issuer_name="2fa")
                user.is2fa = True
                user.save()
                return Response({'otp':otp,},status=200)
            else:
                return Response({'info':'user not found'},status=400)
        except:
            return Response({'info':'user not found'},status=400)
    
    def get(self,request):
        try:
            user = request.user
            if user:
                user.is2fa = False
                user.save()
                return Response({'info':'2fa disabled'},status=200)
            else:
                return Response({'info':'user not found'},status=400)
        except:
            return Response({'info':'user not found'},status=400)
        
class Signin2fa(APIView):
    permission_classes = [AllowAny]
    def post(self,request):
        try:
            email = request.data['email']
            user = User.objects.get(email=email)
            if user and user.is2fa:
                totp = pyotp.TOTP(user.pyotp_secret)
                if totp.verify(request.data['otp']):
                    token = user.token()
                    response = Response({
                        'access': str(token.access_token)
                    },status=status.HTTP_200_OK)
                    response.set_cookie(
                        key='refresh_token',
                        value=token,
                        httponly=True,
                    )
                    return response
                else:
                    return Response({'info':'invalid otp'},status=400)
            else:
                return Response({'info':'user not found or 2fa not enabled'},status=400)
        except:
            return Response({'info':'user not found'},status=400)

class SocialAuth(APIView):
    permission_classes = [AllowAny]
    def post(self,request):
        try:
            platform = request.data['platform']
            if platform == 'github':
                client_id = settings.GITHUB_CLIENT_ID
                redirect_uri = settings.GITHUB_REDIRECT_URI
                url = f'https://github.com/login/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&scope=user:email'
            elif platform == "42":
                client_id = settings.CLIENT_ID
                redirect_uri = settings.INTRA_REDIRECT_URI
                url = f'https://api.intra.42.fr/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code'
            return Response({'url':url},status=200)
        except requests.exceptions.RequestException as e:
            return Response({'info':'error'},status=400)

class SocialAuthverify(APIView):
    permission_classes = [AllowAny]
    serializer_class = SocialAuthontication
    def get(self, request):
        try:
            headers = {'Accept': 'application/json'}
            platform = request.GET.get('platform')
            code = request.GET.get('code')
            if not platform and not code:
                raise AuthenticationFailed('platform and code are required')
            if platform:
                platform = platform.strip().lower()
                if platform == 'github':
                    url = 'https://github.com/login/oauth/access_token'
                    data = {
                    'client_id': settings.GITHUB_CLIENT_ID,
                    'client_secret': settings.GITHUB_CLIENT_SECRET,
                    'code': code,
                    'redirect_uri': settings.GITHUB_REDIRECT_URI
                    }
            else:
                url = 'https://api.intra.42.fr/oauth/token'
                data = {    
                        'grant_type': 'authorization_code',
                        'client_id': settings.CLIENT_ID,
                        'client_secret': settings.CLIENT_SECRET,
                        'code': code,
                        'redirect_uri': settings.INTRA_REDIRECT_URI
                    }
                platform = '42'
            response = requests.post(url, data=data, headers=headers, timeout=10000)
            response.raise_for_status()
            access_token = response.json()['access_token']
            data = {
                'access_token': access_token,
                'platform': platform
            }
            serializer = self.serializer_class(data=data)
            if serializer.is_valid(raise_exception=True):
                email = serializer.validated_data
                user  = User.objects.filter(email=email).first()
                if user :
                    if user.is2fa:
                        return Response({'2fa':True,
                        'email':email
                        })
                    token = user.token()
                    response = Response({
                        'access': str(token.access_token)
                    },status=status.HTTP_200_OK)
                    response.set_cookie(
                        key='refresh_token',
                        value=token,
                        httponly=True,
                    )
                    return response
                else:
                    return Response({'info':'user not found'},status=400)
        except requests.exceptions.RequestException as e:
            return Response({'info':str(e)}, status=400)

class FriendsView(APIView):
    permission_classes = [IsAuthenticated]
    def get (self,request):
        try:
            user = request.user
            friends = user.friends.all()
            serializer = UserSerializer(friends, many=True)
            return Response({'friends':serializer.data},status=200)
        except Exception as e:
            return Response({'info':str(e)},status=400)
    
    def delete(self,request):
        try:
            user = request.user
            friend = request.data['username']
            friend = User.objects.get(username=friend)
            if friend in user.friends.all():
                user.friends.remove(friend)
                if friend in user.blocked.all():
                    user.blocked.remove(friend)
                return Response({'info':'friend deleted'},status=200)
            return Response({'info':'user not found or not a friend'},status=400)
        except Exception as e:
            return Response({'info':str(e)},status=400)

class FriendRequestView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request):
        try:
            user = request.user
            friend = request.data['username']
            friend = User.objects.get(username=friend)
            if friend == user:
                return Response({'info':'you can not send request to yourself'},status=400)
            if friend:
                friend_request = FriendRequest.objects.filter(Q(from_user=user,to_user=friend) | Q(from_user=friend,to_user=user)).first()
                if friend_request:
                    return Response({'info':'friend request already sent'},status=400)
                if friend in user.friends.all():
                    return Response({'info':'you are already friends'},status=400)
                else:
                    if friend.friends.count() > 100:
                        return Response({'info':'user can no longer add friends'},status=400)
                    friend_request = FriendRequest.objects.create(from_user=user,to_user=friend)
                    friend_request.save()
                    channel_layer = get_channel_layer()
                    async_to_sync(channel_layer.group_send)(
                        f'notification_{friend.id}',
                        {
                            'type': 'friend_request',
                            'sender': user.username                  
                        }
                    )
                return Response({'info':'friend request sent'},status=200)
            return Response({'info':'user not found'},status=400)
        except Exception as e:
            return Response({'info':str(e)},status=400)
        
    def get(self,request):
        try:
            user = request.user
            type = request.data['type']
            if type == 'send':
                friend_requests = FriendRequest.objects.filter(Q(from_user=user) & Q(status=0))
            else:
                friend_requests = FriendRequest.objects.filter(Q(to_user=user) & Q(status=0))
            serializer = FriendRequestSerializer(friend_requests, many=True)
            return Response({'friend_requests':serializer.data},status=200)
        except Exception as e:
            return Response({'info':str(e)},status=400)
        
    def put(self,request):
        try:
            user = request.user
            friend = request.data['username']
            friend = User.objects.get(username=friend)
            if friend:
                friend_request = FriendRequest.objects.get(Q(from_user=friend) & Q(to_user=user) & Q(status=0))
                friend_request.delete()
                user.friends.add(friend)
                friend.friends.add(user)
                return Response({'info':'friend request accepted'},status=200)
            return Response({'info':'user not found'},status=400)
        except Exception as e:
            return Response({'info':str(e)},status=400)
    
    def delete(self,request):
        try:
            user = request.user
            friend = request.data['username']
            friend = User.objects.get(username=friend)
            if friend:
                friend_request = FriendRequest.objects.get(Q(from_user=friend) & Q(to_user=user) & Q(status=0) | \
                    Q(from_user=user) & Q(to_user=friend) & Q(status=0))
                friend_request.delete()
                return Response({'info':'friend request deleted'},status=200)
            return Response({'info':'user not found'},status=400)
        except Exception as e:
            return Response({'info':str(e)},status=400)
           
class BlockUser(APIView):
    permission_classes = [IsAuthenticated]

    def post(self,request):
        try:
            user = request.user
            friend = request.data['username']
            
            if friend == user.username:
                return Response({'info':'you can not block yourself'},status=400)
            
            if user.blocked.filter(username=friend).exists():
                return Response({'info':'user allready blocked'},status=400)
            
            if user.friends.filter(username=friend).exists():
                b_friend = user.friends.get(username=friend)
                user.blocked.add(b_friend)
                return Response({'info':'user blocked'},status=200)    
            else:
                return Response({'info':'you are not friend with this user'},status=400)
            
        except User.DoesNotExist:
            return Response({'info':'user Dose Not exsiste'},status=400)
    
    def delete(self,request):
        try:
            user = request.user
            friend = request.data['username']
            if user.blocked.filter(username=friend).exists():
                b_friend = user.blocked.get(username=friend)
                user.blocked.remove(b_friend)
                return Response({'info':'user unblocked'},status=200)
            return Response({'info':'user not blocked'},status=400)
        except User.DoesNotExist:
            return Response({'info':'user Dose Not exsiste'},status=400)
    
    def get(self,request):
        try:
            user = request.user
            blocked = user.blocked.all()
            serializer = UserSerializer(blocked, many=True)
            return Response({'blocked':serializer.data},status=200)
        except Exception as e:
            return Response({'info':str(e)},status=400)

class SearchUser(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FriendSerializer

    def post(self, request):
        try:
            all_users = User.objects.all()
            user_data = self.serializer_class(all_users,many=True,context={'request': request})
            response = Response(
                {'user':user_data.data},status=200
            )
            return response
        except Exception as e:
            return Response({'error': str(e)})

class SearchUserByusername(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def post(self, request):
        try:
            username = request.data['username']
            user = User.objects.get(username=username)
            user_data = self.serializer_class(user)
            response = Response(
                {'user':user_data.data},status=200
            )
            return response
        except Exception as e:
            return Response({'error': str(e)})

class Match(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            user = request.user
            friend = request.data['username']
            friend = User.objects.get(username=friend)
            match = Matches.objects.create(userone=user,usertow=friend)
            async_to_sync(channel_layer.group_send)(
            f'notification_{friend.id}',
                {
                    'type': 'game_invite',
                    'sender': user.username                  
                }
            )
            return Response({'info': 'match created and request sent', 'match_id': match.id}, status=200)
        except Exception as e:
            return Response({'info':str(e)},status=400)
    
    def get(self, request):
        try:
            user = request.user
            friend = request.data['username']
            friend = User.objects.get(username=friend)
            matches = Matches.objects.get((Q(userone=user, usertow=friend) | Q(userone=friend, usertow=user)) & Q(status=0))
            match_data = Machserializer(matches, many=True)
            return Response({'matches':match_data.data},status=200)
        except Matches.DoesNotExist:
            return Response({'info': 'No match found'}, status=404)
        except Exception as e:
            return Response({'info': str(e)}, status=400)

    def put(self, request):
        try:
            user = request.user
            friend = request.data['username']
            friend = User.objects.get(username=friend)
            match = Matches.objects.get(Q(userone=user) & Q(usertow=user) & Q(status=0))
            match.status = 1
            match.save()
            return Response({'info': 'Match accepted'}, status=200)
        except Matches.DoesNotExist:
            return Response({'info': 'No pending match found'}, status=404)
        except Exception as e:
            return Response({'info': str(e)}, status=400)
            
    def delete(self, request):
        try:
            user = request.user
            friend = request.data['username']
            friend = User.objects.get(username=friend)
            match = Matches.objects.get((Q(userone=user, usertow=friend) | Q(userone=friend, usertow=user)) & Q(status=0))
            if match.exists():
                match.first().delete()
                return Response({'info': 'Match deleted successfully'}, status=200)
            else:
                return Response({'info': 'No match found to delete'}, status=404)
        except Exception as e:
            return Response({'info': str(e)}, status=400)
        
class Recent_Matches(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            user = request.user
            friend = request.data['username']
            friend = User.objects.get(username=friend)
            matches = Matches.objects.get((Q(userone=user, usertow=friend) | Q(userone=friend, usertow=user)) & Q(status=1))
            match_data = Machserializer(matches, many=True)
            return Response({'matches':match_data.data},status=200)
        except Exception as e:
            return Response({'info':str(e)},status=400)

class LeaderBoard(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            matches = Matches.objects.all()[:6]
            match_data = Machserializer(matches, many=True)
            return Response({'matches':match_data.data},status=200)
        except Exception as e:
            return Response({'info':str(e)},status=400)

class Password_Change(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request):
        try:
            user = request.user
            old_password = request.data.get('old_password')
            password = request.data.get('password')
            password1 = request.data.get('password1')
            if password != password1:
                return Response({'error': 'New passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

            if not user.check_password(old_password):
                return Response({'error': 'Incorrect old password.'}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(password)
            user.save()
            return Response({'success': 'Password changed successfully.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)