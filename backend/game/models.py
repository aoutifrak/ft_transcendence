from django.db import models
from profiles.models import User

class Game(models.Model):
    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player1', null=True, blank=True)
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player2', null=True, blank=True)
    room_name = models.CharField(max_length=100, unique=True)
    game_state = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    winner = models.CharField(max_length=100, null=True, blank=True)
    loser = models.CharField(max_length=100, null=True, blank=True)

    def set_game_state(self, state):
        self.game_state = state

    def get_game_state(self):
        return self.game_state
