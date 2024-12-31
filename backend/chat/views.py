from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Message, Chat
from .serializers import MessageSerializer , ChatSerializer
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomPagination(PageNumberPagination):
    page_size = 10 

class Messages(APIView):
    pagination_class = CustomPagination
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            username = request.GET['username']
            user2 = User.objects.get(username=username)
            chats = Chat.objects.filter(Q(user1=request.user) & Q(user2=user2) |Q(user1=user2) & Q(user2=request.user)).first()
            messages = Message.objects.filter(chat=chats.id)
            paginator = self.pagination_class()
            paginated_messages = paginator.paginate_queryset(messages, request)            
            serializer = MessageSerializer(paginated_messages, many=True)
            return paginator.get_paginated_response(serializer.data)
        except Exception as e:
            return Response({str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request):
        try:
            user = request.user
            message_id = request.data['message_id']
            message = Message.objects.get(id=message_id)
            if message.sender != user:
                return Response('You are not the sender of this message', status=status.HTTP_400_BAD_REQUEST)
            message.delete()
            return Response('Message deleted', status=status.HTTP_200_OK)
        except Exception as e:
            return Response({str(e)}, status=status.HTTP_400_BAD_REQUEST)

class Chat_Room(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    def get(self, request):
        try:
            paginator = self.pagination_class()
            chats = Chat.objects.filter(user1=request.user)
            paginated_chats = paginator.paginate_queryset(chats, request)            
            serializer = ChatSerializer(paginated_chats, many=True)
            return paginator.get_paginated_response(serializer.data)
        except Exception as e:
            return Response({str(e)},status=status.HTTP_400_BAD_REQUEST)
        
