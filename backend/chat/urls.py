from django.urls import path
from . import views

urlpatterns = [
    # path('chat/', views.chat, name='chat'),
    path('messages/', views.Messages.as_view(), name='messages'),
]
###``