from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path("ws/league/<str:game_id>", consumers.GameConsumer.as_asgi()),
]