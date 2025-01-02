
from django.urls import path 
from .views import *
from django.contrib import admin

urlpatterns = [path('notif', GetNotification.as_view()),]