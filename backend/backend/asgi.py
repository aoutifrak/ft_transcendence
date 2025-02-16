"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""
# import os
# from django.core.asgi import get_asgi_application
# from channels.auth import AuthMiddlewareStack
# from channels.routing import ProtocolTypeRouter, URLRouter
# from chat import routing, middleware
# from channels.security.websocket import AllowedHostsOriginValidator
# from notification import routing as notification_routing
# from pong import routing as pong_routing
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# application = ProtocolTypeRouter({
#     "http": get_asgi_application(),
#     "websocket": AllowedHostsOriginValidator(middleware.TokenAuthMiddleware(
#             URLRouter(
#                 routing.websocket_urlpatterns
#                 + notification_routing.websocket_urlpatterns
#                 + pong_routing.websocket_urlpatterns
#         )
#     )
#     ),
# })


import os
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from chat import routing, middleware
from channels.security.websocket import AllowedHostsOriginValidator
from notification import routing as notification_routing
from pong import routing as pong_routing
from game import routing as game_routing
from matchmaking import routing as matchmaking_routing
from PongMatch import routing as PongMatch_routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(middleware.TokenAuthMiddleware(
            URLRouter(
                routing.websocket_urlpatterns
                + notification_routing.websocket_urlpatterns
                + pong_routing.websocket_urlpatterns
                + game_routing.websocket_urlpatterns
                + matchmaking_routing.websocket_urlpatterns
                + PongMatch_routing.websocket_urlpatterns
        )
    )
    ),
})
