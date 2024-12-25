## **Password Change API Endpoint**

### **Endpoint:**
`/api/pass`

### **HTTP Method:**
POST

### **Authentication:**
Required (IsAuthenticated permission class)

### **Request Body:**
```json
{
    "old_password": "your_old_password",
    "password": "your_new_password",
    "password1":"your_new_password_confirmation"
}
Response:
Success (HTTP 200 OK):

JSON

{
    "success": "Password changed successfully."
}
Error (HTTP 400 Bad Request):

JSON

{
    "error": "Error message"  // Specific error message will be provided
}
Possible Error Messages:

New passwords do not match.
Incorrect old password.
Generic error message (if an unexpected exception occurs)

# Matches API Documentation

This documentation provides details about the Matches API, including endpoint purposes, request formats, and response structures. This API enables users to create, retrieve, accept, and delete matches, as well as view recent matches.

## General Information
- **Base URL**: `/api/` (example, adjust as needed)
- **Authentication**: All endpoints require the user to be authenticated. Use a token or session-based authentication.

---

### 1. POST - Create a Match
**Purpose**: Create a new match request from the authenticated user to another user.

#### Request
- **URL**: `/api/matches/`
- **Method**: `POST`
- **Headers**:
  ```json
  {
    "Authorization": "Token <user_token>"
  }
  ```
- **Body**:
  ```json
  {
    "username": "friend_username"
  }
  ```

#### Response
- **Success**:
  ```json
  {
    "info": "Match created and request sent",
    "match_id": 123
  }
  ```
- **Error Cases**:
  - `Cannot match with yourself` (400)
  - `Friend user not found` (404)
  - Any other error:
    ```json
    {
      "info": "<error_message>"
    }
    ```

---

### 2. GET - Fetch All Pending Matches
**Purpose**: Retrieve all pending match requests for the authenticated user.

#### Request
- **URL**: `/api/matches/`
- **Method**: `GET`
- **Headers**:
  ```json
  {
    "Authorization": "Token <user_token>"
  }
  ```

#### Response
- **Success**:
  ```json
  {
    "matches": [
      {
        "id": 123,
        "userone": "current_user_username",
        "usertow": "friend_username",
        "created_at": "2024-12-11T10:00:00Z",
        "status": 0
      },
      {
        "id": 124,
        "userone": "friend_username",
        "usertow": "current_user_username",
        "created_at": "2024-12-11T12:00:00Z",
        "status": 0
      }
    ]
  }
  ```
- **Error Cases**:
  ```json
  {
    "info": "<error_message>"
  }
  ```

---

### 3. PUT - Accept a Match
**Purpose**: Accept a pending match request.

#### Request
- **URL**: `/api/matches/`
- **Method**: `PUT`
- **Headers**:
  ```json
  {
    "Authorization": "Token <user_token>"
  }
  ```
- **Body**:
  ```json
  {
    "username": "friend_username"
  }
  ```

#### Response
- **Success**:
  ```json
  {
    "info": "Match accepted"
  }
  ```
- **Error Cases**:
  - `No pending match found` (404)
  - Any other error:
    ```json
    {
      "info": "<error_message>"
    }
    ```

---

### 4. DELETE - Delete a Match
**Purpose**: Cancel or delete a pending match request.

#### Request
- **URL**: `/api/matches/`
- **Method**: `DELETE`
- **Headers**:
  ```json
  {
    "Authorization": "Token <user_token>"
  }
  ```
- **Body**:
  ```json
  {
    "username": "friend_username"
  }
  ```

#### Response
- **Success**:
  ```json
  {
    "info": "Match deleted successfully"
  }
  ```
- **Error Cases**:
  - `No match found to delete` (404)
  - Any other error:
    ```json
    {
      "info": "<error_message>"
    }
    ```

---

### 5. GET - Fetch Recent Matches
**Purpose**: Retrieve recent matches that have been accepted by both users.

#### Request
- **URL**: `/api/recent`
- **Method**: `GET`
- **Headers**:
  ```json
  {
    "Authorization": "Token <user_token>"
  }
  ```
- **Body**:
  ```json
  {
    "username": "friend_username"
  }
  ```

#### Response
- **Success**:
  ```json
  {
    "matches": [
      {
        "id": 125,
        "userone": "current_user_username",
        "usertow": "friend_username",
        "created_at": "2024-12-11T10:00:00Z",
        "status": 1
      }
    ]
  }
  ```
- **Error Cases**:
  ```json
  {
    "info": "<error_message>"
  }
  ```

---

## Important Notes
1. **Error Handling**:
   - Display the `info` field from error responses to users for better feedback.

2. **Authorization**:
   - Ensure the user is logged in and their token is attached to each request in the `Authorization` header.

3. **Match Status**:
   - `status` values in responses:
     - `0`: Pending.
     - `1`: Accepted.

4. **Real-Time Notifications**:
   - WebSocket channel triggered upon match creation. Front-end should listen to the channel `notification_<user_id>` to handle incoming notifications.

5. **Validation**:
   - Validate `username` before sending it in requests to avoid unnecessary API errors.

6. **Data Caching**:
   - For repeated GET calls, consider caching match data to reduce API hits and improve performance.

# API Documentation: /api/leaderboard

## Endpoint Overview

**URL**: `/api/leaderboard`  
**Method**: `GET`  
**Authentication**: Required (User must be authenticated)  
**Permission**: `IsAuthenticated`

## Description

This endpoint retrieves the most recent 6 matches from the leaderboard. It provides detailed information about each match, which can be used by the front-end to display the leaderboard data.

## Request

### Headers:
- **Authorization**: Bearer token (Required for authentication)

### Example Request:

GET /api/leaderboard
Authorization: Bearer <JWT_TOKEN>
Response
Success (200 OK):
The response contains an array of the most recent 6 matches.
{
  "matches": [
    {
      "id": 1,
      "team_1": "Team A",
      "team_2": "Team B",
      "score_1": 3,
      "score_2": 2,
      "date": "2024-12-10T14:00:00Z"
    },
    {
      "id": 2,
      "team_1": "Team C",
      "team_2": "Team D",
      "score_1": 4,
      "score_2": 1,
      "date": "2024-12-09T16:00:00Z"
    },
    ...
  ]
}

Error (400 Bad Request):
If there is any issue with the request, an error
Example Error Response:
{
  "info": "An error occurred while fetching the matches."
}

# WebSocket Chat API Documentation

## Endpoint Overview

**Endpoint URL**: `/ws/chat/`  
**Method**: WebSocket (`ws://` or `wss://` for secure connection)  
**Authentication**: JWT token passed as a query parameter  
**Purpose**: Real-time chat functionality where users can send and receive messages.

## Sending a Message

To send a message, the front-end will send a JSON object containing:
- **receiver**: The **username** of the recipient (instead of user ID).
- **message**: The content of the message being sent.

**Message Format**:
```json
{
  "receiver": "username_of_recipient",  // The recipient's username
  "message": "Your message content"
}

Receiving a Message
When the user receives a message, the WebSocket will send a chat.message event containing:

sender: The sender's username.
message: The content of the received message.

Message Format:
{
  "type": "chat.message",
  "sender": "username_of_sender",  // The sender's username
  "message": "Received message content"
}

'''

# Endpoint Documentation: Friend Request Management

### Endpoint
**`GET /api/friend_req`**

### Description
This endpoint retrieves friend requests for the authenticated user. Depending on the `type` parameter in the request body, it fetches either sent or received friend requests that are pending (status = 0).

---

### Request Format

#### Headers
- **Authorization**: Bearer `<JWT Token>` (required)

#### Body Parameters
| Parameter | Type   | Required | Description                     |
|-----------|--------|----------|---------------------------------|
| `type`    | string | Yes      | Type of friend requests to fetch. Possible values: `send` or `receive`. |

---

### Response Format

#### Success (200 OK)
Returns a list of friend requests matching the specified type.

```json
{
    "friend_requests": [
        {
            "id": 1,
            "from_user": "user1",
            "to_user": "user2",
            "status": 0,
            "created_at": "2024-12-13T10:00:00Z"
        },
        {
            "id": 2,
            "from_user": "user3",
            "to_user": "user4",
            "status": 0,
            "created_at": "2024-12-12T15:30:00Z"
        }
    ]
}

Returns an error message if an issue occurs.

json
Copy code
{
    "info": "Error message describing the issue."
}

xamples
Fetch Sent Friend Requests
Request

http
Copy code
GET /api/friend_req HTTP/1.1
Authorization: Bearer <JWT Token>
Content-Type: application/json

{
    "type": "send"
}
Response

json
Copy code
{
    "friend_requests": [
        {
            "id": 1,
            "from_user": "user1",
            "to_user": "user2",
            "status": 0,
            "created_at": "2024-12-13T10:00:00Z"
        }
    ]
}
Fetch Received Friend Requests
Request

http
Copy code
GET /api/friend_req HTTP/1.1
Authorization: Bearer <JWT Token>
Content-Type: application/json

{
    "type": "receive"
}
Response

json
Copy code
{
    "friend_requests": [
        {
            "id": 2,
            "from_user": "user3",
            "to_user": "user4",
            "status": 0,
            "created_at": "2024-12-12T15:30:00Z"
        }
    ]
}
Copy code







## Chat Room API

### GET `/api/chat/`
Retrieve a list of all chat rooms associated with the authenticated user.

- **Authentication**: Required (`IsAuthenticated`)
- **Request Body**: None

#### Response:
- **Success (200 OK)**:
  ```json
  [
      {
          "id": 1,
          "user1": "user1_username",
          "user2": "user2_username",
          "timestamp": "2024-12-15T12:00:00Z"
      },
      {
          "id": 2,
          "user1": "user1_username",
          "user2": "user3_username",
          "timestamp": "2024-12-15T12:10:00Z"
      }
  ]

Error (400 Bad Request):

{
    "error": "Error message here"
}

Messages API
GET /api/messages/
Retrieve all messages from a specific chat.

Authentication: Beraer Token
Request Body:

{
    "chat_id": 1
}

Response:
Success (200 OK)
[
    {
        "id": 1,
        "chat": 1,
        "sender_user": "user1_username",
        "receiver_user": "user1_username",
        "message": "Hello!",
        "updated_at": "2024-12-15T12:00:00Z"
    },
    {
        "id": 2,
        "chat": 1,
        "sender_user": "user2_username",
        "receiver_user": "user1_username",
        "message": "Hi there!",
        "updated_at": "2024-12-15T12:01:00Z"
    }
]

Error (400 Bad Request):
{
    "error": "Error message here"
}


DELETE /api/messages/
Delete a specific message sent by the authenticated user.

Authentication: Beraer Token
Request Body:
Success (200 OK):
"Message deleted"


Error (400 Bad Request):
"You are not the sender of this message"


Pagination
The Messages API supports pagination with a custom pagination class. By default, 10 messages are returned per page.

Query Parameters:
page: The page number to retrieve (e.g., ?page=2).
Example Paginated Response:

{
    "count": 10,
    "next": "http://127.0.0.1:8000/api/messages/?page=2",
    "previous": null,
    "results": [
        {
          "id": 1,
          "chat": 1,
          "sender_user": "user2_username",
          "receiver_user": "user1_username",
          "message": "Hi there!",
          "updated_at": "2024-12-15T12:01:00Z"
          },
        {
          "id": 2,
          "chat": 1,
          "sender_user": "user2_username",
          "receiver_user": "user1_username",
          "message": "Hi there!",
          "updated_at": "2024-12-15T12:01:00Z"
      }
    ]
}


# Friends API Documentation

## Overview
The **Friends API** allows authenticated users to view their friends and remove a friend from their friend list. This API includes two main endpoints: one for retrieving the user's friends and another for deleting a friend.

## Endpoints

### 1. **GET /api/friends

#### Description:
This endpoint retrieves the list of friends for the authenticated user.

#### Permissions:
- **IsAuthenticated**: Only authenticated users can access this endpoint.

#### Response:
- **200 OK**: Returns the list of friends for the authenticated user.
- **400 Bad Request**: If there is an error in retrieving the friends list.

#### Example Request:
```http
GET /api/friends?page=1
Authorization: Bearer <your_token>
Example Response:
{
  "friends": [
    {
      "id": 1,
      "username": "friend1",
      "email": "friend1@example.com",
      "first_name": "Friend",
      "last_name": "One"
    },
    {
      "id": 2,
      "username": "friend2",
      "email": "friend2@example.com",
      "first_name": "Friend",
      "last_name": "Two"
    }
  ]
}

DELETE /api/friends/
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "username": "friend2"
}

Example Response:

{
  "info": "friend deleted"
}
Error Response Example:
{
  "info": "user not found or not a friend"
}




## update  user avatar /api/update_user

Authorization: Bearer <your_token>
Content-Type: multipart/form-data

{
    "avatar":"/user/avatar.jpeg"
}