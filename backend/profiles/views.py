from matchmaking.models import Match
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from .serializer import UserSerializer , LoginUserSerializer ,User_Register , SocialAuthontication ,FriendRequestSerializer ,FriendSerializer ,ByUserSerializer
from .models import User , FriendRequest 
import jwt 
from django.contrib.auth import logout
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
from notification.models import Notification
from rest_framework.pagination import PageNumberPagination
from game.models import Game
from game.serializers import GameSerializer
from pong.models import Game as PongGame
from pong.serializers import GameSerializer as PongGameSerializer
from itertools import chain

class CustomPagination(PageNumberPagination):
    page_size = 10 

class CustomPage(PageNumberPagination):
    page_size = 25 

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
                user.is_online = True
                user.save()
                response = Response({
                    'access': str(token.access_token)
                },status=status.HTTP_200_OK)
                response.set_cookie(
                    key='refresh_token',
                    value=token,
                    httponly=True,
                    secure=True,
                )
                return response
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class Sign_upView(APIView):
    permission_classes = [AllowAny]
    def post(self,request):
        try:
            infos = request.data
            
            valid_keys = ['email','username','password','first_name','last_name']
            for key in infos.keys():
                if key not in valid_keys:
                    return Response({"error": f"invalid fileds {key}!"},status=status.HTTP_400_BAD_REQUEST)
        
            email = request.data.get('email')
            if User.objects.filter(email=email).exists():
                raise AuthenticationFailed('Email already exists')

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
                return Response({"message": serializer.data['avatar']},status=status.HTTP_200_OK)
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
            user = request.user
            refresh = request.COOKIES.get('refresh_token',None)
            if refresh is not None:
                token = RefreshToken(refresh)
                token.blacklist()
                user.is_online = False
                user.save()
                notif_group_name = f"notification_{user.id}"
                logout(request)
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    notif_group_name,
                    {
                        'type': 'disconnect',
                    }
                )
                response = Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
                response.delete_cookie('refresh_token')
                return response

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
                    user.is_online = True
                    user.save()
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
            if platform == "42":
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
            code = request.GET.get('code')
            if not code:
                raise AuthenticationFailed('platform and code are required')
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
                user  = User.objects.get(email=email)
                if user :
                    if user.is2fa:
                        return Response({'2fa':True,
                        'email':email
                        })
                    token = user.token()
                    user.is_online = True
                    user.save()
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
        except Exception as e:
            return Response({'info':str(e)}, status=400)

class FriendsView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPage
    def get (self,request):
        try:
            paginator = self.pagination_class()
            user = request.user
            friends = user.friends.all()
            friend = paginator.paginate_queryset(friends, request)
            serializer = ByUserSerializer(friend, many=True,context={'request': request})
            return paginator.get_paginated_response(serializer.data)
        except Exception as e:
            return Response({'info':str(e)},status=400)
    
    def delete(self,request):
        try:
            user = request.user
            friend = request.data['username']
            friend = User.objects.get(username=friend)
            if friend in user.friends.all():
                user.friends.remove(friend)
                channel_layer = get_channel_layer()
                user_data = UserSerializer(instance=user).data
                async_to_sync(channel_layer.group_send)(
                    f'notification_{friend.id}',
                    {
                        'type': 'unfriend',
                        'sender': user_data      
                    }
                )
                return Response({'info':'friend deleted'},status=200)
            return Response({'info':'user not found or not a friend'},status=400)
        except Exception as e:
            return Response({'info':str(e)},status=400)

class FriendRequestView(APIView):
    pagination_class = CustomPagination
    permission_classes = [IsAuthenticated]
    def post(self,request):
        try:
            user = request.user
            friend = request.data['username']
            friend = User.objects.get(username=friend)
            if friend == user:
                return Response({'info':'you can not send request to yourself'},status=200)
            if friend:
                friend_request = FriendRequest.objects.filter(Q(from_user=user,to_user=friend) | Q(from_user=friend,to_user=user)).first()
                if friend_request:
                    return Response({'info':'friend request already sent'},status=200)
                if friend in user.friends.all():
                    return Response({'info':'you are already friends'},status=200)
                if friend in user.blocked.all():
                    return Response({'info':'you blocked this user'},status=200)
                else:
                    if friend.friends.count() > 100:
                        return Response({'info':'user can no longer add friends'},status=200)
                    friend_request = FriendRequest.objects.create(from_user=user,to_user=friend)
                    friend_request.save()
                    notif = Notification.objects.create(sender_notif=user ,receiver_notif=friend,type='friend_request',message=f'{user.username} sent you a friend request')
                    notif.save()
                    channel_layer = get_channel_layer()
                    user_data = UserSerializer(instance=user).data
                    async_to_sync(channel_layer.group_send)(
                        f'notification_{friend.id}',
                        {
                            'type': 'friend_request',
                            'sender': user_data      
                        }
                    )
                return Response({'info':'friend request sent'},status=200)
            return Response({'info':'user not found'},status=400)
        except Exception as e:
            return Response({'info':str(e)},status=400)
        
    def get(self,request):
        try:
            user = request.user
            paginator = self.pagination_class()
            friend_requests = FriendRequest.objects.filter(Q(from_user=user) | Q(to_user=user) & Q(status=0))
            paginated_friend_req = paginator.paginate_queryset(friend_requests, request)
            serializer = FriendRequestSerializer(paginated_friend_req, many=True ,context={'request': request})
            return paginator.get_paginated_response(serializer.data)
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
                notif = Notification.objects.get(Q(sender_notif=friend) & Q(receiver_notif=user)| \
                    Q(sender_notif=user) & Q(receiver_notif=friend)) 
                notif.delete()
                channel_layer = get_channel_layer()
                user_data = UserSerializer(user).data
                async_to_sync(channel_layer.group_send)(
                    f'notification_{friend.id}',
                    {
                        'type': 'accept_request',
                        'sender': user_data                  
                    }
                )
                return Response({'info':'friend request accepted'},status=200)
        except User.DoesNotExist:
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
                notif = Notification.objects.get(Q(sender_notif=friend) & Q(receiver_notif=user)| \
                    Q(sender_notif=user) & Q(receiver_notif=friend)) 
                notif.delete()
                channel_layer = get_channel_layer()
                user_data = UserSerializer(instance=user).data
                async_to_sync(channel_layer.group_send)(
                    f'notification_{friend.id}',
                    {
                        'type': 'reject_request',
                        'sender': user_data                  
                    }
                )
                return Response({'info':'friend request deleted'},status=200)
        except User.DoesNotExist:
            return Response({'info':'user not found'},status=400)
        except Exception as e:
            return Response({'info':str(e)},status=400)
           
class BlockUser(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    def post(self,request):
        try:
            user = request.user
            friend = request.data['username']
            
            if friend == user.username:
                return Response({'info':'you can not block yourself'},status=400)
            
            if user.blocked.filter(username=friend).exists():
                return Response({'info':'user allready blocked'},status=400)
            
            b_friend = User.objects.get(username=friend)
            user.blocked.add(b_friend)
            channel_layer = get_channel_layer()
            user_data = UserSerializer(instance=user).data
            async_to_sync(channel_layer.group_send)(
                f'notification_{b_friend.id}',
                {
                    'type': 'block_request',
                    'sender': user_data                  
                }
            )
            return Response({'info':'user blocked'},status=200)
        except User.DoesNotExist:
            return Response({'info':'user Dose Not exsiste'},status=400)
    
    def delete(self,request):
        try:
            user = request.user
            friend = request.data['username']
            if user.blocked.filter(username=friend).exists():
                b_friend = user.blocked.get(username=friend)
                user.blocked.remove(b_friend)
                channel_layer = get_channel_layer()
                user_data = UserSerializer(instance=user).data
                async_to_sync(channel_layer.group_send)(
                    f'notification_{b_friend.id}',
                    {
                        'type': 'unblock_request',
                        'sender': user_data                  
                    }
                )
                return Response({'info':'user unblocked'},status=200)
            return Response({'info':'user not blocked'},status=400)
        except User.DoesNotExist:
            return Response({'info':'user Dose Not exsiste'},status=400)

class SearchUser(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FriendSerializer
    pagination_class = CustomPagination

    def post(self, request):
        try:
            paginator = self.pagination_class()
            all_users = User.objects.exclude(id=request.user.id)
            all_user = paginator.paginate_queryset(all_users, request)
            user_data = self.serializer_class(all_user, many=True, context={'request': request})
            return paginator.get_paginated_response(user_data.data)
        except Exception as e:
            return Response({'error': str(e)})

class SearchUserByusername(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ByUserSerializer

    def post(self, request):
        try:
            username = request.data['username']
            user = User.objects.get(username=username)
            user_data = self.serializer_class(user , context={'request': request})
            response = Response(user_data.data,status=200)
            return response
        except Exception as e:
            return Response({'error': str(e)})

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
        
class Leaderboard(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    def get(self,request):
        try:
            users = User.objects.all().order_by('-score')[:6]

            serializer = UserSerializer(users, many=True)

            return Response(serializer.data)
        except Exception as e:
            return Response({'info': str(e)}, status=400)
        
class UserRecentGames(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            try:
                username = request.GET['username']
                user = User.objects.get(username=username)
            except:
                user = request.user
                pass

            league_games = Game.objects.filter(
                (Q(player1=user) | Q(player2=user)) &
                Q(winner__isnull=False) &
                Q(player1__isnull=False) &
                Q(player2__isnull=False)
            )

            pong_games = PongGame.objects.filter(
                (Q(player1=user) | Q(player2=user)) &
                ~Q(winner='Unknown') &
                Q(player1__isnull=False) &
                Q(player2__isnull=False)
            )

            combined_games = sorted(
                chain(league_games, pong_games),
                key=lambda game: game.updated_at,
                reverse=True
            )

            response_data = []
            for game in combined_games:
                if isinstance(game, Game):
                    serializer = GameSerializer(game)
                else:
                    serializer = PongGameSerializer(game)
                response_data.append(serializer.data)

            return Response(response_data, status=200)
            return Response(response_data)
        except Exception as e:
            print(e)
            return Response({'info': str(e)}, status=400)

class ResentGames(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        try:
            leagueGames = Game.objects.filter(winner__isnull=False).order_by('-updated_at')[:10]
            pongGames = PongGame.objects.filter(~Q(winner='Unknown') & Q(player1__isnull=False) & Q(player2__isnull=False)).order_by('-updated_at')[:10]
            combined_games = sorted(
                chain(leagueGames, pongGames),
                key=lambda game: game.updated_at,
                reverse=True
            )

            response_data = []
            for game in combined_games:
                if isinstance(game, Game):
                    serializer = GameSerializer(game)
                else:
                    serializer = PongGameSerializer(game)
                response_data.append(serializer.data)
            return Response(response_data)
        except Exception as e:
            return Response({'info': str(e)}, status=400)
    
class MatchMaking(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        try: 
            username = request.GET['username']
            player = request.user
            user = User.objects.get(username=username)
            if user == player:
                return Response({'cannot play with your self'})
            if user.on_game == True:
                return Response({'player is bussy'})

            user_data = UserSerializer(player).data
            matchs = Match.objects.create(
                player1_username=str(player.username),
                player1_level=int(player.level),
                player2_username=str(user_data['username']),
                player2_level=int(user_data['level'])
            )
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"notification_{user.id}",
                {
                    'sender':user_data,
                    'type': 'game_invite',
                    'game_id': matchs.match_id
                }
            )
            return Response({'game_id':matchs.match_id},status=200)
        except Exception as e:
            return Response({'info':str(e)},status=400)

class AcceptInvite(APIView):
    permission_classes = [IsAuthenticated]
    def put(self,request):
        try:
            game_id = request.data['game_id']
            user = request.user
            user_data = UserSerializer(user).data
            matchs = Match.objects.get(match_id=game_id)
            player1 = User.objects.get(username=matchs.player1_username)
            if user == player1:
                return Response({'cannot play with your self'},status=400)
            if player1.on_game:
                raise TokenError({'player is bussy'})
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"notification_{player1.id}",
                {
                    'sender':user_data,
                    'type': 'accept_invite',
                    'game_id': matchs.match_id
                }
            )
            return Response({'game_id':matchs.match_id},status=200)
        except Match.DoesNotExist:
            return Response({'game_id not exsiste'},status=400)
        except Exception as e:
            return Response({'info':str(e)},status=400)

class WaurnTurnement(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ByUserSerializer

    def post(self, request):
        try:
            user = request.user
            user_data = UserSerializer(user).data
            channel_layer = get_channel_layer()
            for friend in user.friends.all():
                async_to_sync(channel_layer.group_send)(
                    f"notification_{friend.id}",
                    {
                        'sender':user_data,
                        'type': 'invite_tournemet',
                    }
                )
            return Response('Done',status=200)
        except Exception as e:
            return Response({'info': str(e)}, status=400)