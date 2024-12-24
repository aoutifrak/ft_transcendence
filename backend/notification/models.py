from django.db import models
from profiles.models import User
# Create your models here.
class Notification(models.Model):
    sender_notif = models.ForeignKey(User, related_name='sender_notif', on_delete=models.DO_NOTHING)
    receiver_notif = models.ForeignKey(User, related_name='receiver_notif', on_delete=models.DO_NOTHING)
    type = models.CharField(max_length=255)
    message = models.CharField(max_length=255)
        
    class Meta:
        db_table = "Notification"