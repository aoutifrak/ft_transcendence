from django.urls import path
from . import views

urlpatterns = [
    path('conversations', views.Chat_Room.as_view(), name='chat'),
    path('messages/', views.Messages.as_view(), name='messages'),
]
###``