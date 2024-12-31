import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.exceptions import AcceptConnection, DenyConnection, StopConsumer
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from asgiref.sync import sync_to_async
from django.db import IntegrityError
from profiles.models import User
from .models import Game
import asyncio
from datetime import timedelta
import time


PADDLE_SPEED = 400
# self.ball_speed = 800
PADDLE_HEIGHT = 100
PADDLE_WIDTH = 20
BALL_SIZE = 10
DELTA_TIME = 0.016



class PongConsumer(AsyncWebsocketConsumer):
    game_states = {}
    # key { paddpos, ball posl,}
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Initialize integer variables in the constructor
        self.canvas_width = 700  # Another example
        self.canvas_height = 350  # Example integer variable
        self.ball_update_task = None  # Add this line
        self.ball_speed = 200  # Add this line

    @sync_to_async
    def update_game_state(self, direction, is_player_one):
        """Update the game state in the database"""
        if is_player_one:
            match direction:
                case 'up':
                    self.game.left_paddle_dir = -1
                case 'down':
                    self.game.left_paddle_dir = 1
                case 'stop':
                    self.game.left_paddle_dir = 0
        else:
            match direction:
                case 'up':
                    self.game.right_paddle_dir = -1
                case 'down':
                    self.game.right_paddle_dir = 1
                case 'stop':
                    self.game.right_paddle_dir = 0
    
    @sync_to_async
    def save_paddle_positions(self, left_y, right_y):
        """Save the new paddle positions to the database"""
        self.game.paddle_player1 = left_y
        self.game.paddle_player2 = right_y
        self.game.save()

    @sync_to_async
    def get_available_game(self, room_name):
        return Game.objects.filter(room=room_name).first()

    @sync_to_async
    def create_game(self, room_name):
        return Game.objects.create(player1=self.user, 
                                   player2=None, 
                                   paddle_player1=self.canvas_height / 2 - 50, 
                                   paddle_player2=self.canvas_height / 2 - 50, 
                                   ball_x=self.canvas_width / 2 - 5,
                                   ball_y=self.canvas_height / 2 - 5,
                                   type_game="pong",
                                   room=room_name)
    @sync_to_async
    def save_game(self, game):
        game = self.game
        game.save()
        # print("save in db: ", self.game.ballSpeedX)
    
    @sync_to_async
    def add_player2(self, game):
        game.player2 = self.user
        game.save()
        return game

    @sync_to_async
    def is_player_one(self):
        print("==========================user: ", self.user)
        print("==============player1: ", self.game.player1, "================player2: ", self.game.player2)
        return self.game.player1 == self.user
        
    @sync_to_async
    def check_player1(self, game):
        return game.player1 == self.user

    @sync_to_async
    def get_game(self):
        try:
            # Get game using the game_id stored during connection
            return Game.objects.get(id=self.game.id)
        except Game.DoesNotExist:
            print(f"Game with ID {self.game.id} not found")
            return None
    
    @sync_to_async
    def get_player_usernames(self, game):
        return {
            'player1': game.player1.username,
            'player2': game.player2.username if game.player2 else None
        }
    
    @sync_to_async
    def new_left_paddle_y(self):
        left_paddle_y = max(
        0,
        min(
            self.canvas_height - PADDLE_HEIGHT,
            self.game.paddle_player1 + self.game.left_paddle_dir * PADDLE_SPEED * DELTA_TIME
        )
    )
        return left_paddle_y
    
    @sync_to_async
    def new_right_paddle_y(self):
        right_paddle_y = max(
        0,
        min(
            self.canvas_height - PADDLE_HEIGHT,
            self.game.paddle_player2 + self.game.right_paddle_dir * PADDLE_SPEED * DELTA_TIME
        )
    )
        return right_paddle_y
    
    @sync_to_async
    def Update_ball_position(self):
        # print(self.game.ball_x, self.game.ball_y)
        # print("before: ", self.game.ballSpeedX)
        if self.game.ballSpeedX == 0.0:
            if (self.game.score_player1 + self.game.score_player2) % 2 == 0:
                self.game.ballSpeedX = 0.4
            else:
                self.game.ballSpeedX = -0.4
        # print("after: ", self.game.ballSpeedX)
        self.game.ball_x = self.game.ball_x + self.game.ballSpeedX * self.ball_speed * DELTA_TIME
        self.game.ball_y = self.game.ball_y + self.game.ballSpeedY * self.ball_speed * DELTA_TIME

        next_y = self.game.ball_y + self.game.ballSpeedY * self.ball_speed * DELTA_TIME
        next_x = self.game.ball_x + self.game.ballSpeedX * self.ball_speed * DELTA_TIME

        # Ball collision with top and bottom
        if next_y <= 0:  # Top collision
            print("Top collision detected")
            self.game.ball_y = abs(next_y)  # Bounce back from top
            self.game.ballSpeedY = abs(self.game.ballSpeedY)  # Ensure downward movement
        elif next_y >= self.canvas_height - BALL_SIZE:  # Bottom collision
            print("Bottom collision detected")
            excess = next_y - (self.canvas_height - BALL_SIZE)
            self.game.ball_y = (self.canvas_height - BALL_SIZE) - excess  # Bounce back from bottom
            self.game.ballSpeedY = -abs(self.game.ballSpeedY)  # Ensure upward movement
        else:
            self.game.ball_y = next_y  # No collision, normal movement

        self.game.ball_x = next_x  # Update x position
        # Ball collision with paddles
        if (self.game.ball_x <= PADDLE_WIDTH and 
            self.game.ball_y + BALL_SIZE >= self.game.paddle_player1 and 
            self.game.ball_y <= self.game.paddle_player1 + PADDLE_HEIGHT):

            if(self.ball_speed < 800):
                    print("ball_speeeeeeeeed :", self.ball_speed)
                    self.ball_speed+= 20
            # print("colide with left paddle")
            self.game.ball_x = PADDLE_WIDTH + 1
            self.game.ballSpeedX = -self.game.ballSpeedX
            # 
            # Calculate new direction (not speed) based on where ball hits paddle
            paddle_center = self.game.paddle_player1 + PADDLE_HEIGHT / 2
            hit_position = self.game.ball_y - paddle_center

            # If hit very close to center, randomly choose up or down direction
            if abs(hit_position) < (PADDLE_HEIGHT * 0.1):  # 10% of paddle height as center zone
                import random
                hit_position = random.choice([-1, 1]) * PADDLE_HEIGHT * 0.25  # Force a non-zero angle

            # Calculate new Y direction
            direction_multiplier = hit_position / (PADDLE_HEIGHT / 2)  # -1 to 1
            self.game.ballSpeedY = abs(self.game.ballSpeedX) * direction_multiplier  # Use X speed

        if (self.game.ball_x >= self.canvas_width - PADDLE_WIDTH - BALL_SIZE and 
            self.game.ball_y + BALL_SIZE >= self.game.paddle_player2 and 
            self.game.ball_y <= self.game.paddle_player2 + PADDLE_HEIGHT):

            if(self.ball_speed < 800):
                    print("ball_speeeeeeeeed :", self.ball_speed)
                    self.ball_speed+= 20
            # print("colide with right paddle")
            print(self.game.ball_x, self.game.ball_y)
            self.game.ball_x = self.canvas_width - PADDLE_WIDTH - BALL_SIZE - 1
            self.game.ballSpeedX = -self.game.ballSpeedX
            paddle_center = self.game.paddle_player2 + PADDLE_HEIGHT / 2
            hit_position = self.game.ball_y - paddle_center

        # If hit very close to center, randomly choose up or down direction
            if abs(hit_position) < (PADDLE_HEIGHT * 0.1):  # 10% of paddle height as center zone
                import random
                hit_position = random.choice([-1, 1]) * PADDLE_HEIGHT * 0.25  # Force a non-zero angle

            # Calculate new Y direction
            direction_multiplier = hit_position / (PADDLE_HEIGHT / 2)  # -1 to 1
            self.game.ballSpeedY = abs(self.game.ballSpeedX) * direction_multiplier  # Use X speed

        if (self.game.ball_x <= 0):
            self.game.score_player2 += 1
            if(self.game.score_player2 == 7):
                self.game.winner = self.game.player2.username
                self.game.loser = self.game.player1.username
            self.game.ball_x = self.canvas_width / 2
            self.game.ball_y = self.canvas_height / 2
            self.game.ballSpeedX = 0.0
            self.ball_speed = 200
            self.game.ballSpeedY = 0.0
        elif self.game.ball_x >= self.canvas_width:
            self.game.score_player1 += 1
            if(self.game.score_player1 == 7):
                self.game.winner = self.game.player1.username
                self.game.loser = self.game.player2.username
            self.game.ball_x = self.canvas_width / 2
            self.game.ball_y = self.canvas_height / 2
            self.game.ballSpeedX = 0.0
            self.ball_speed = 200
            self.game.ballSpeedY = 0.0

        # print("after save in self.game: ", self.game.ballSpeedX)



    @sync_to_async
    def _reset_ball(self):
        """Reset ball to center with random direction"""
        self.game.ball_x = self.canvas_width / 2
        self.game.ball_y = self.canvas_height / 2
        self.game.ballSpeedX = 0.0
        self.game.ballSpeedY = 0.0
        self.game.save()

    async def connect(self):
        try:
            self.user = self.scope['user']
            self.room_group_name = f'pong_210'

            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            existing_game = await self.get_available_game(self.room_group_name)
            # print(f"No game for you {self.user.username}" if existing_game == None else f"let join the game {self.user.username}")
            if existing_game is None:
                self.game = await self.create_game(self.room_group_name)
                # print("==============player1: ", self.game.player1, "================player2: ", self.game.player2)
                # print(f"New game created by {self.user.username} as player1")
            elif await self.check_player1(existing_game) == False:
                # print("++++++++++++++++++app player2")
                self.game = await self.add_player2(existing_game)
                # print("player1:", self.game.player1, "++++player2:", self.game.player2)


                # Get usernames in an async-safe way
                players = await self.get_player_usernames(self.game)
                # print(f"{players['player2']} joined as player2")

                self.ball_update_task = asyncio.create_task(self.update_ball_position_interval())

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'game_message',
                        'message': {
                            'type': 'game_ready',
                            'player1': players['player1'],
                            'player2': players['player2']
                        }
                    }
                )

            await self.accept()
        except Exception as e:
            print(f"Unexpected error in connect: {str(e)}")
            await self.close()

    async def game_message(self, event):
        await self.send(text_data=json.dumps(event['message']))

    async def disconnect(self, close_code):
        try:
            print(f"WebSocket disconnected with code: {close_code}")

            # Cancel the ball update task if it exists
            if self.ball_update_task and not self.ball_update_task.done():
                self.ball_update_task.cancel()
                try:
                    await self.ball_update_task
                except asyncio.CancelledError:
                    print("Ball update task cancelled successfully")

            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

        except Exception as e:
            print(f"Error in disconnect: {str(e)}")
            
    # async def start_ball_movement(self):
    #     """Start the ball movement if it's not already running"""
    #     if not self.ball_update_task or self.ball_update_task.done():
    #         self.ball_update_task = asyncio.create_task(self.update_ball_position_interval())

    # async def stop_ball_movement(self):
    #     """Stop the ball movement if it's running"""
    #     if self.ball_update_task and not self.ball_update_task.done():
    #         self.ball_update_task.cancel()
    #         try:
    #             await self.ball_update_task
    #         except asyncio.CancelledError:
    #             print("Ball update task cancelled successfully")
                
    async def update_ball_position_interval(self):
        """Periodically update the ball position."""
        try:
            while True:
                try:
                    game = await self.get_available_game(self.room_group_name)
                    if not game:
                        print("Game not found, stopping ball updates")
                        break

                    self.game = game
                    await self.Update_ball_position()
                    await self.save_game(game)


                    if (self.check_player1(game)):
                        await self.channel_layer.group_send(
                            self.room_group_name,
                            {
                                'type': 'game_message',
                                'message': {
                                    'type': "ball_position",
                                    'newBallX': self.game.ball_x,
                                    'newBallY': self.game.ball_y,
                                    'newBallSpeedX': self.game.ballSpeedX,
                                    'newBallSpeedY': self.game.ballSpeedY,
                                    'rightScore': self.game.score_player2,
                                    'leftScore': self.game.score_player1,
                                    'leftPaddleY': self.game.paddle_player1,
                                    'rightPaddleY': self.game.paddle_player2
                                }
                            }
                        )
                    if(self.game.winner != "Unknown"):
                        await self.channel_layer.group_send(
                            self.room_group_name,
                            {
                                'type': 'game_message',
                                'message': {
                                    'type': "end_game",
                                    'winner': self.game.winner,
                                    'loser': self.game.loser
                                }
                            }
                        )

                    await asyncio.sleep(0.01)

                except Exception as e:
                    print(f"Error in ball update loop: {str(e)}")
                    await asyncio.sleep(1)  # Wait longer on error

        except asyncio.CancelledError:
            print("Ball update task cancelled")
            raise
        except Exception as e:
            print(f"Fatal error in ball update task: {str(e)}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)

            # if data.get('type') == 'start_game':
            #     await self.start_ball_movement()

            # elif data.get('type') == 'stop_game':
            #     await self.stop_ball_movement()

            if data.get('type') == 'paddle_move':
                direction = data.get('direction')

                if direction not in ['up', 'down', 'stop']:
                    return

                # Check if the user is player one
                is_player_one = await self.check_player1(self.game)

                # get the game from db
                game = await self.get_available_game(self.room_group_name)
                self.game = game;

                # Update paddle direction
                await self.update_game_state(direction, is_player_one)

                try:
                    # Calculate new paddle positions
                    new_left_y = await self.new_left_paddle_y()
                    new_right_y = await self.new_right_paddle_y()

                    # Save the new positions
                    await self.save_paddle_positions(new_left_y, new_right_y)
                    await self.save_game(game)

                    # Broadcast the paddle movement
                    # await self.channel_layer.group_send(
                    #     self.room_group_name,
                    #     {
                    #         'type': 'game_message',
                    #         'message': {
                    #             'type': "update_paddle",
                    #             'leftPaddleY': new_left_y,
                    #             'rightPaddleY': new_right_y
                    #         }
                    #     }
                    # )
                except Exception as e:
                    print(f"Error updating paddle positions: {str(e)}")
                    await self.send(text_data=json.dumps({
                        'type': 'error',
                        'message': 'Failed to update paddle position'
                    }))

            elif data.get('type') == 'update_ball':
                game = await self.get_available_game(self.room_group_name)
                print("game_id: ", game.id)
                self.game = game;
                print("from db: ", game.ballSpeedX)
                await self.Update_ball_position()
                await self.save_game(game)

                # Broadcast the update_ball
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'game_message',
                        'message': {
                            'type': "ball_position",
                            'newBallX': self.game.ball_x,
                            'newBallY': self.game.ball_y,
                            'newBallSpeedX': self.game.ballSpeedX,
                            'newBallSpeedY': self.game.ballSpeedY
                        }
                    }
                )
                if await self.update_score():
                    await self.save_game(game)
                    # Broadcast the update_score
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'game_message',
                            'message': {
                                'type': "score_update",
                                'rightScore': self.game.score_player2,
                                'leftScore': self.game.score_player1
                            }
                        }
                    )
                
        
        except json.JSONDecodeError:
            print("Invalid JSON received")
        except Exception as e:
            print(f"Error processing message: {str(e)}")

    async def game_message(self, data):
        try:
            await self.send(text_data=json.dumps(data['message']))
        except Exception as e:
            print(f"Error sending message: {str(e)}")