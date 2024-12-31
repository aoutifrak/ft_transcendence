


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


localhost:8000/ws/chat/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzM1NjE1MDIzLCJpYXQiOjE3MzU2MTQ3MjMsImp0aSI6IjIyOGU0N2Q5M2QxYzRmNmI5YWRmZTBjYmE5MmFkOTYzIiwidXNlcl9pZCI6M30.oKsLIJ_jxutUoZNGx7gBzc6G2LIWhgZwavDc2BHkgdM

example sending
{
    "receiver":"aoutifrak",
    "message":"zsjnkmlasdfadsfksdgmkasdgml;;a;'d;"
}

example of what you will recive
{
    "message": {
        "id": 9,
        "chat": 1,
        "sender": {
            "email": "aoutifra@student.1337.ma",
            "first_name": "Amine",
            "last_name": "Outifrakh",
            "username": "aoutifra",
            "avatar": "/media/avatars/default.jpeg",
            "created_at": "2024-12-31T00:53:48.697383Z",
            "last_login": null,
            "wins": 0,
            "losses": 0,
            "level": 0,
            "matches_played": 0,
            "is2fa": false,
            "is_online": true,
            "rank": 0
        },
        "message": "zsjnkmlasdfadsfksdgmkasdgml;;a;'d;",
        "updated_at": "2024-12-31T03:13:44.709629Z"
    }
}





Endpoint: api/chat/messages/
Methods Supported:
GET: Retrieve paginated messages between the authenticated user and another user.
DELETE: Delete a specific message sent by the authenticated user.
GET Method
Description:
Fetches all messages exchanged between the authenticated user and another user identified by their username. The response is paginated.

Query Parameters:
username (string) - The username of the other user involved in the chat.
Response:
Success (200 OK):
json

{
    "count": <total_number_of_messages>,
    "next": <next_page_url>,

    "previous": <previous_page_url>,
    "results": [
        {
            "id": <message_id>,
            "sender": <sender_username>,
            "receiver": <receiver_username>,
            "content": <message_content>,
            "timestamp": <timestamp>
        },
        ...
    ]
}
Error (400 Bad Request):
json

{
    "error": "<error_message>"
}

Example Request:
http

GET /messages/api/chat?username=johndoe HTTP/1.1
Authorization: Bearer <token>
Example Success Response:

json


{
  "count": 9,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 9,
      "chat": 1,
      "sender": {
        "email": "aoutifra@student.1337.ma",
        "first_name": "Amine",
        "last_name": "Outifrakh",
        "username": "aoutifra",
        "avatar": "/media/avatars/default.jpeg",
        "created_at": "2024-12-31T00:53:48.697383Z",
        "last_login": null,
        "wins": 0,
        "losses": 0,
        "level": 0,
        "matches_played": 0,
        "is2fa": false,
        "is_online": true,
        "rank": 0
      },
      "message": "zsjnkmlasdfadsfksdgmkasdgml;;a;'d;",
      "updated_at": "2024-12-31T03:13:44.709629Z"
    },
    {
      "id": 8,
      "chat": 1,
      "sender": {
        "email": "aoutifra@student.1337.ma",
        "first_name": "Amine",
        "last_name": "Outifrakh",
        "username": "aoutifra",
        "avatar": "/media/avatars/default.jpeg",
        "created_at": "2024-12-31T00:53:48.697383Z",
        "last_login": null,
        "wins": 0,
        "losses": 0,
        "level": 0,
        "matches_played": 0,
        "is2fa": false,
        "is_online": true,
        "rank": 0
      },
      "message": "zsjnkmlasdfadsfksdgmkasdgml;;a;'d;",
      "updated_at": "2024-12-31T03:12:15.915262Z"
    },
    {
      "id": 7,
      "chat": 1,
      "sender": {
        "email": "aoutifra@student.1337.ma",
        "first_name": "Amine",
        "last_name": "Outifrakh",
        "username": "aoutifra",
        "avatar": "/media/avatars/default.jpeg",
        "created_at": "2024-12-31T00:53:48.697383Z",
        "last_login": null,
        "wins": 0,
        "losses": 0,
        "level": 0,
        "matches_played": 0,
        "is2fa": false,
        "is_online": true,
        "rank": 0
      },
      "message": "zsjnkmlasdfadsfksdgmkasdgml;;a;'d;",
      "updated_at": "2024-12-31T03:10:14.106769Z"
    },
    {
      "id": 6,
      "chat": 1,
      "sender": {
        "email": "aoutifra@student.1337.ma",
        "first_name": "Amine",
        "last_name": "Outifrakh",
        "username": "aoutifra",
        "avatar": "/media/avatars/default.jpeg",
        "created_at": "2024-12-31T00:53:48.697383Z",
        "last_login": null,
        "wins": 0,
        "losses": 0,
        "level": 0,
        "matches_played": 0,
        "is2fa": false,
        "is_online": true,
        "rank": 0
      },
      "message": "zsjnkmlasdfadsfksdgmkasdgml;;a;'d;",
      "updated_at": "2024-12-31T03:07:33.643369Z"
    },
    {
      "id": 5,
      "chat": 1,
      "sender": {
        "email": "aoutifra@student.1337.ma",
        "first_name": "Amine",
        "last_name": "Outifrakh",
        "username": "aoutifra",
        "avatar": "/media/avatars/default.jpeg",
        "created_at": "2024-12-31T00:53:48.697383Z",
        "last_login": null,
        "wins": 0,
        "losses": 0,
        "level": 0,
        "matches_played": 0,
        "is2fa": false,
        "is_online": true,
        "rank": 0
      },
      "message": "zsjnkmlasdfadsfksdgmkasdgml;;a;'d;",
      "updated_at": "2024-12-31T03:05:48.130236Z"
    },
    {
      "id": 4,
      "chat": 1,
      "sender": {
        "email": "aoutifra@student.1337.ma",
        "first_name": "Amine",
        "last_name": "Outifrakh",
        "username": "aoutifra",
        "avatar": "/media/avatars/default.jpeg",
        "created_at": "2024-12-31T00:53:48.697383Z",
        "last_login": null,
        "wins": 0,
        "losses": 0,
        "level": 0,
        "matches_played": 0,
        "is2fa": false,
        "is_online": true,
        "rank": 0
      },
      "message": "zsjnkmlasdfadsfksdgmkasdgml;;a;'d;",
      "updated_at": "2024-12-31T03:04:32.781732Z"
    },
    {
      "id": 3,
      "chat": 1,
      "sender": {
        "email": "aoutifra@student.1337.ma",
        "first_name": "Amine",
        "last_name": "Outifrakh",
        "username": "aoutifra",
        "avatar": "/media/avatars/default.jpeg",
        "created_at": "2024-12-31T00:53:48.697383Z",
        "last_login": null,
        "wins": 0,
        "losses": 0,
        "level": 0,
        "matches_played": 0,
        "is2fa": false,
        "is_online": true,
        "rank": 0
      },
      "message": "zsjnkmlasdfadsfksdgmkasdgml;;a;'d;",
      "updated_at": "2024-12-31T03:02:06.838570Z"
    },
    {
      "id": 2,
      "chat": 1,
      "sender": {
        "email": "aoutifra@student.1337.ma",
        "first_name": "Amine",
        "last_name": "Outifrakh",
        "username": "aoutifra",
        "avatar": "/media/avatars/default.jpeg",
        "created_at": "2024-12-31T00:53:48.697383Z",
        "last_login": null,
        "wins": 0,
        "losses": 0,
        "level": 0,
        "matches_played": 0,
        "is2fa": false,
        "is_online": true,
        "rank": 0
      },
      "message": "zsjnkmlasdfadsfksdgmkasdgml;;a;'d;",
      "updated_at": "2024-12-31T03:02:00.364191Z"
    },
    {
      "id": 1,
      "chat": 1,
      "sender": {
        "email": "aoutifrak@example.com",
        "first_name": "",
        "last_name": "",
        "username": "aoutifrak",
        "avatar": null,
        "created_at": "2024-12-30T23:09:14.293307Z",
        "last_login": null,
        "wins": 0,
        "losses": 0,
        "level": 0,
        "matches_played": 0,
        "is2fa": false,
        "is_online": true,
        "rank": 0
      },
      "message": "zsjnkmlasdfadsfksdgmkasdgml;;a;'d;",
      "updated_at": "2024-12-31T02:58:25.279225Z"
    }
  ]
}
DELETE Method
Description:
Deletes a specific message sent by the authenticated user.

Request Body:
message_id (integer) - The ID of the message to be deleted.
Response:
Success (200 OK):
json

{
    "message": "Message deleted"
}

Error (400 Bad Request):
If the message does not belong to the user:
json

{
    "error": "You are not the sender of this message"
}

For other errors:
json

{
    "error": "<error_message>"
}

Example Request:
http

DELETE /messages/api/chat HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json


{
    "message_id": 1
}
Example Success Response:
json

{
    "message": "Message deleted"
}

Permissions:
Authentication: Required (Bearer Token).
Permissions: The authenticated user can only delete messages they sent.
Error Handling:
If the username parameter is missing or invalid in the GET request, or the message ID is invalid or unauthorized in the DELETE request, a 400 Bad Request response will be returned with an error message.






