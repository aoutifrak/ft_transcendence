from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Message, Chat
from .serializers import MessageSerializer, ChatSerializer
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination

class CustomPagination(PageNumberPagination):
    page_size = 10 

class Chat_Room(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            chats = Chat.objects.filter(Q(user1=request.user) | Q(user2=request.user))
            serializer = ChatSerializer(chats, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({str(e)},status=status.HTTP_400_BAD_REQUEST)
        

class Messages(APIView):
    pagination_class = CustomPagination
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            chat_id = request.data['chat_id']
            messages = Message.objects.filter(chat=chat_id)
            serializer = MessageSerializer(messages, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
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
