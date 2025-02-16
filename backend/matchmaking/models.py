from django.db import models

class Match(models.Model):
    match_id = models.AutoField(primary_key=True)
    player1_username = models.CharField(max_length=255)
    player1_level = models.IntegerField()
    player2_username = models.CharField(max_length=255)
    player2_level = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
