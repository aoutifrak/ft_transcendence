from django.shortcuts import render
from django.views import View  # Import View class
from django.http import HttpResponse

def lobby(request):
        return render(request, 'chat/lobby.html')
