from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from rest_framework_simplejwt.tokens import RefreshToken
from .manager import UserManager

def validate_image(image):
    if not image.name.endswith(('.png', '.jpg')):
        raise ValidationError("Only .png, .jpg, or .jpeg files are allowed.")

class User(AbstractBaseUser):
    first_name = models.CharField(max_length=25,blank=True)
    last_name = models.CharField(max_length=25,blank=True)
    username = models.CharField(max_length=20,unique=True)
    email = models.EmailField(max_length=255,unique=True)
    password = models.CharField(max_length=255)
    avatar = models.ImageField(upload_to='avatars/', validators=[validate_image],default='avatars/default.jpeg',blank=True)
    pyotp_secret = models.CharField(max_length=255, default='')
    
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    is2fa = models.BooleanField(default=False)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    level = models.IntegerField(default=0)
    matches_played = models.IntegerField(default=0)
    is_online = models.BooleanField(default=False)
    rank = models.IntegerField(default=0)
    
    friends = models.ManyToManyField('self', blank=True, symmetrical=True)
    
    blocked = models.ManyToManyField('self', blank=True, symmetrical=False)

    USERNAME_FIELD = 'username'

    objects = UserManager()

    class Meta:
        db_table = "User"

    def token(self):
        refresh = RefreshToken.for_user(self)
        return refresh
    
    def __str__(self):
        return f'{self.first_name} {self.last_name} {self.email}'
    


class FriendRequest(models.Model):
    from_user = models.ForeignKey(User, related_name='from_user', on_delete=models.DO_NOTHING)
    to_user = models.ForeignKey(User, related_name='to_user', on_delete=models.DO_NOTHING)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.IntegerField(default=0)
    
    class Meta:
        db_table = "Friend_Request"
        unique_together = ['from_user', 'to_user']


class Matches(models.Model):
    userone = models.ForeignKey(User, related_name='userone', on_delete=models.DO_NOTHING)
    usertow = models.ForeignKey(User, related_name='usertow', on_delete=models.DO_NOTHING)
    winner = models.ForeignKey(User, related_name='winner', on_delete=models.DO_NOTHING)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.IntegerField(default=0)
    
    class Meta:
        db_table = "Matches"
        unique_together = ['userone', 'usertow']
        ordering = ['-created_at']