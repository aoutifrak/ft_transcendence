
from django.urls import path 
from .views import *
from django.contrib import admin

urlpatterns = [
    path('signup', Sign_upView.as_view()),
    path('login', LoginView.as_view()),
    path('logout', LogoutView.as_view()),
    path('user_info', Get_user_info.as_view()),
    path('oauth', SocialAuth.as_view()),
    path('socialauth/', SocialAuthverify.as_view()),
    path('refresh_token', RefreshTokenView.as_view()),
    path('friends', FriendsView.as_view()),
    path('friend_req/', FriendRequestView.as_view()),
    path('block_user', BlockUser.as_view()),
    path('enable2fa', Control2Fa.as_view()),
    path('signin2fa', Signin2fa.as_view()),
    path('search_user', SearchUser.as_view()),
    path('search_username', SearchUserByusername.as_view()),
    path('Verify_token', verifyToken.as_view()),
    path('pass', Password_Change.as_view()), 
    path('update_user',UserUpdate.as_view()),
    path('leaderboard', Leaderboard.as_view()),
    path('user_recent_games', UserRecentGames.as_view()),
    path('recent_games', ResentGames.as_view()),
    path('matchmaking', MatchMaking.as_view()),
    path('accept_invite', AcceptInvite.as_view()),
    path('warn_tr', WaurnTurnement.as_view()),
]