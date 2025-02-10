from django.urls import path , include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('api/', include('profiles.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/notification/', include('notification.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

