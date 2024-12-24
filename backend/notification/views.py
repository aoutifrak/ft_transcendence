from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from .models import Notification
from .serializers import Notification_serializer
from rest_framework.permissions import IsAuthenticated
# Create your views here.
class GetNotification(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = Notification_serializer

    def get(self,request):
        try:
            user = request.user
            notification = Notification.objects.filter(receiver_notif=user)
            serialized_notification = self.serializer_class(notification,many=True)
            return Response(serialized_notification.data,status=200)
        except Exception as e:
            return Response({'info':str(e)},status=400)
