from django.db import models
from django.contrib.auth import get_user_model
# Create your models here.
User = get_user_model()

class Chat(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='user1')
    user2 = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='user2')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user1', 'user2']
        db_table = 'chat'
        
class Message(models.Model):
    id = models.AutoField(primary_key=True)
    chat = models.ForeignKey(Chat, on_delete=models.DO_NOTHING)
    sender = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='sender_message')
    receiver = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='receiver_message')
    message = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'message'
        ordering = ['-id']
