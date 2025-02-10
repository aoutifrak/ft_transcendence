from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()

@database_sync_to_async
def get_user(token):
    try:
        user_id = AccessToken(token).payload['user_id']
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None

class TokenAuthMiddleware:
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        try:
            query_string = scope["query_string"]
            token = query_string.decode().split("=")[1]
            user = await get_user(token)
            if user is not None:
                scope['user'] = user
        except:
            await send({
                "type": "websocket.close",
                "code":4001
            })
            return None
        return await self.app(scope, receive, send)
