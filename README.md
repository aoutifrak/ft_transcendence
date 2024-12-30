


GET http://127.0.0.1:8000/api/notification/notif
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzM1NTc4NDA0LCJpYXQiOjE3MzU1NzgxMDQsImp0aSI6IjYyOWNiNzRjMGYyNTQwNzE5YzJkMzhhOWMyYzJhYTIyIiwidXNlcl9pZCI6Mn0.Ck7jU4jLDmbV68Ohl6ZNOq5Gw-9YbrE9oiUhMwjXJjM

responce example

{
  "count": 1,
  "next": null,
  "previous": null,
  "results": {
    "notifications": [
      {
        "id": 4,
        "sender_notif": {
          "email": "user1@example.com",
          "first_name": "",
          "last_name": "",
          "username": "user1",
          "avatar": "/media/avatars/default.jpeg",
          "created_at": "2024-12-30T15:29:52.015344Z",
          "last_login": null,
          "wins": 0,
          "losses": 0,
          "level": 0,
          "matches_played": 0,
          "is2fa": false,
          "is_online": true,
          "rank": 0
        },
        "type": "friend_request",
        "message": "user1 sent you a friend request",
        "receiver_notif": 2
      }
    ]
  }
}