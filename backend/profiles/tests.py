from django.test import TestCase

# Create your tests here.
from .models import User
import random
import string
from .models import User, FriendRequest


def generate_random_email(length=10):
    """Generates a random email address."""
    letters = string.ascii_lowercase
    username = ''.join(random.choice(letters) for _ in range(length))
    domain = random.choice(['gmail.com', 'yahoo.com', 'hotmail.com', 'example.com'])
    return f"{username}@{domain}"

def generate_users(length=10):
    """Generates a random email address."""
    letters = string.ascii_lowercase
    username = ''.join(random.choice(letters) for _ in range(length))
    return {username}

class UserTests(TestCase):

    def test_create_multiple_users_and_send_requests_to_one(self):
        """
        Creates 20 users with random usernames and emails,
        and sends friend requests from each of them to a single user.
        """
        usernames = [generate_users() for _ in range(20)]
        emails = [generate_random_email() for _ in range(20)]

        # Create a single target user
        target_user = User.objects.create_user(
            username='target_user',
            email='target_user@example.com',
            password='testpassword'
        )

        users = []
        for username, email in zip(usernames, emails):
            user = User.objects.create_user(
                username=username,
                email=email,
                password='testpassword'
            )
            users.append(user)
            self.assertIsNotNone(user.pk)

        # Send friend requests from each user to the target user
        for user in users:
            friend_request = FriendRequest.objects.create(from_user=user, to_user=target_user)
            self.assertEqual(friend_request.status, 0)  # Assert that the initial status is 0 (Pending)
