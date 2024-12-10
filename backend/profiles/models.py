from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from rest_framework_simplejwt.tokens import RefreshToken
from .manager import UserManager
from django.core.validators import EmailValidator, RegexValidator, MinLengthValidator

def validate_image(image):
    if not image.name.endswith(('.png', '.jpg')):
        raise ValidationError("Only .png, .jpg, or .jpeg files are allowed.")

class User(AbstractBaseUser, PermissionsMixin):
    first_name = models.CharField(
        max_length=25,
        validators=[
            MinLengthValidator(2),
            RegexValidator( 
                regex=r'^[a-zA-Z]*$',
                message='First name must be at least 2 characters long and contain only letters'
                )
            ]
        )
    last_name = models.CharField(
        max_length=25,
        validators=[MinLengthValidator(2),
        RegexValidator(
                regex=r'^[a-zA-Z]*$',
                message='First name must be at least 2 characters long and contain only letters'
                ),
            ]
        )
    username = models.CharField(max_length=20,
        unique=True,
        null=True,
        blank=True,
        validators=[MinLengthValidator(2),
        RegexValidator(
                regex=r'^(?=.*[a-zA-Z])[a-zA-Z0-9_]*$',
                message='username must be at least 2 characters long and contain only letters and numbers and underscores'
                ),
            ]
        )
    email = models.EmailField(
        max_length=255,
        unique=True,
        validators=[EmailValidator(message='Please enter a valid email address')]
        )
    password = models.CharField(max_length=255)
    avatar = models.ImageField(upload_to='avatars/', validators=[validate_image],default='avatars/default.png')
    bio = models.CharField(max_length=300, default="write somthing nice here")
    is_superuser = models.BooleanField(default=False)
    pyotp_secret = models.CharField(max_length=255, default='')
    
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    last_login = models.DateTimeField(auto_now=True, null=True)
    is2fa = models.BooleanField(default=False)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    draws = models.IntegerField(default=0)
    matches_played = models.IntegerField(default=0)
    is_online = models.BooleanField(default=False)

    friends = models.ManyToManyField('self', blank=True, symmetrical=True)
    
    blocked = models.ManyToManyField('self', blank=True, symmetrical=False)

    USERNAME_FIELD = 'email'
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
        
    def __str__(self):
        return f'{self.from_user.username} to {self.to_user.username}'
    


class BlacklistedToken(models.Model):
    token = models.CharField(max_length=500, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Blacklisted Token: {self.token}"
