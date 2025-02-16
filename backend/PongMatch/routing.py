from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path("ws/PongMatch/", consumers.PongMatchConsumer.as_asgi()),
]