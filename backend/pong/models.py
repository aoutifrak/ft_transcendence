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
    score_player1 = models.IntegerField(default=0)
    bol_player1 = models.BooleanField(default=0)
    score_player2 = models.IntegerField(default=0)
    bol_player2 = models.BooleanField(default=0)
    paddle_player1 = models.IntegerField(default=0)
    paddle_player2 = models.IntegerField(default=0)
    ball_x = models.IntegerField(default=0)
    ball_y = models.IntegerField(default=0)
    ballSpeedX = models.FloatField(default=0.0)
    ballSpeedY = models.FloatField(default=0.0)
    left_paddle_dir = models.IntegerField(default=0)
    right_paddle_dir = models.IntegerField(default=0)
    winner = models.CharField(max_length=100, default="Unknown") 
    loser = models.CharField(max_length=100, default="Unknown") 
    type_game = models.CharField(max_length=25,blank=True)
    room = models.CharField(max_length=25,blank=True)
    

    def __str__(self):
        return f"Game between {self.player1.username} and {self.player2.username}"
