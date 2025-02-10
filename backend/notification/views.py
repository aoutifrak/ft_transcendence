from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from .models import Notification
from .serializers import Notification_serializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination

class CustomPagination(PageNumberPagination):
    page_size = 10 

class GetNotification(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    serializer_class = Notification_serializer

    def get(self,request):
        try:
            user = request.user
            notification = Notification.objects.filter(receiver_notif=user)
            paginator = self.pagination_class()
            notifications = paginator.paginate_queryset(notification, request, view=self)
            serialized_notification = self.serializer_class(notifications,many=True)
            return paginator.get_paginated_response(serialized_notification.data)
        except Exception as e:
            return Response({'info':str(e)},status=400)
