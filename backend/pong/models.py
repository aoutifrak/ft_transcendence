from django.db import models
from profiles.models import User

class Game(models.Model):
    player1 = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='games_as_player1',
        null=True,  # Allow null
        blank=True  # Allow blank in forms
        
    )
    player2 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='games_as_player2',
        null=True,  # Allow null
        blank=True  # Allow blank in forms
    )
    game_state = models.JSONField(default=dict)
    winner = models.CharField(max_length=100, default="Unknown") 
    loser = models.CharField(max_length=100, default="Unknown") 
    room = models.CharField(max_length=25,blank=True)

#     py from django.db import models
# from profiles.models import User

# class Game(models.Model):
#     player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player1', null=True, blank=True)
#     player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player2', null=True, blank=True)
#     room_name = models.CharField(max_length=100, unique=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def set_game_state(self, state):
#         self.game_state = state

#     def get_game_state(self):
#         return self.game_state
    

    def __str__(self):
        return f"Game between {self.player1.username} and {self.player2.username}"