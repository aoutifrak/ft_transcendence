# ft_transcendence
**Table of Contents:**
- [Description](#description)
- [Tech Stack](#tech-stack)
- [Modules](#modules)
- [Setup](#setup)

## Description

[ft_transcendence] is a web application that allows users to play a 3D version of the classic Pong game. The game is implemented using ReactJs and the backend is implemented using Django. Users can play against each other Localy , remotely, play against an  opponent, create tournaments. The project also includes user management, authentication, and live chat.


## Tech Stack

| Category  | Technology |
| ------------- | ------------- |
| **Languages** | ![typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) |
| **Frontend**  | ![reactjs](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white) ![tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)|
| **Backend** | ![django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=green)  ![django rest framework](https://img.shields.io/badge/django%20rest-ff1709?style=for-the-badge&logo=django&logoColor=white)|
| **Database** | ![postgresql](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) |
| **Authentication** | ![jwt](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white) |
| **Containerization** | ![docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) |
| **Caching** | ![redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white) |
| **Tools** | ![git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white) ![vscode](https://img.shields.io/badge/VSCode-0078D4?style=for-the-badge&logo=visual%20studio%20code&logoColor=white) ![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=Postman&logoColor=white) ![Firefox](https://img.shields.io/badge/Firefox_Browser-FF7139?style=for-the-badge&logo=Firefox-Browser&logoColor=white)|
**
## Modules

- required:

| Module | Type | Description | Done |
| --- | --- | --- | --- |
| **Backend Framework** | Major | Django as a backend Framework | ✅ |
| **User Management** | Major | Standard user management, authentication, users across tournaments| ✅ |
| **Advanced 3D Techniques** | Major | The Pong game is implemented using Three.js | ✅ |
| **Remote Players** | Major | Users can play against each other remotely | ✅ |
| **Remote Authentication** | Major | OAuth 2.0 authentication with 42  | ✅ |
| **Live Chat** | Major | Users can send direct messages to other users | ✅ |
| **Server-Side Pong** | Major | Replacing Basic Pong with Server-Side Pong | ✅ |
| **Database Backend** | Minor | PostgreSQL as a database backend | ✅ |
| **Browser Compatibility** | Minor | The Web App should be compatible with all major browsers | ✅ |

- stuff i added:

| Module | Description |Done |
| --- | --- | --- |
| **Real-Time Notifications** | Users can receive real-time notifications (game invites, new chat Messages...) | ✅ |
| **Resumable Games** | Users can resume games and tournaments where they left off | ✅ |
| **Games History** | Users can see All the games they played (local, online, tournament) | ✅ |

## Setup
1. Clone the repository
```bash
git clone https://github.com/aoutifrak/ft_transcendence.git
```
2. Change the directory
```bash
cd ft_transcendence
```
3. replace `HOST_MC` with your IP address in `example.env` and `SERVER_NAME` files and rename them to `.env` .
4. Run the following command to start the project
```bash
docker compose up
```

**Note:** `Login with 42` will not work for you as it requires a 42 API key.

