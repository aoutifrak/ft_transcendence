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


PADDLE_SPEED = 300
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
        self.canvas_width = 700
        self.room_name = None  # Another example
        self.canvas_height = 350  # Example integer variable
        self.ball_update_task = None  # Add this line
        self.ball_speed = 200  # Add this line
        self.player_number = None

    def create_initial_game_state(self):
        return {
            'score_player1': 0,       
            'score_player2': 0,            
            'ball': {
                'x': self.canvas_width / 2 - 5,
                'y': self.canvas_height / 2 - 5,
                'speedX': 0.0,
                'speedY': 0.0,
            },      
            'winner': 0,              
            'player2': {
                'dir': 0,    
                'paddle_player2': self.canvas_height / 2 - 50,      
                'connected': False,
                'input': {
                    'up': False,
                    'down': False,
                }
            },              
            'player1': {
                'dir ': 0,   
                'paddle_player1': self.canvas_height / 2 - 50,      
                'connected': False,
                'input': {
                    'up': False,
                    'down': False,
                }
            },              
            'room': self.room_name,         
        }

    async def update_game_state(self, game_states):
        for player_key in ['player1', 'player2']:
            player = game_states[player_key]
            if player['input']['up']:
                player['dir'] = -1
            elif player['input']['down']:
                player['dir'] = 1
            else:
                player['dir'] = 0
    
    async def save_paddle_positions(self, left_y, right_y, game_states):
        game_states['player1']['paddle_player1'] = left_y
        game_states['player2']['paddle_player2'] = right_y

    @sync_to_async
    def get_available_game(self, room_name):
        return Game.objects.filter(room=room_name).first()

    @sync_to_async
    def create_game(self, room_name):
        game_state = self.create_initial_game_state()
        PongConsumer.game_states[room_name] = game_state
        return Game.objects.create(room=room_name, game_state=game_state, player1=self.user, player2=None)
    
    @sync_to_async
    def add_player2(self, game):
        game.player2 = self.user
        game.save()
        return game
        
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
    def get_player1(self, game):
        return game.player1
    
    @sync_to_async
    def get_player2(self, game):
        return game.player2

    async def new_left_paddle_y(self, game_state):
        left_paddle_y = max(
        0,
        min(
            self.canvas_height - PADDLE_HEIGHT,
            game_state['player1']['paddle_player1'] + game_state['player1']['dir'] * PADDLE_SPEED * DELTA_TIME
        )
    )
        return left_paddle_y
    
    async def new_right_paddle_y(self, game_states):
        right_paddle_y = max(
        0,
        min(
            self.canvas_height - PADDLE_HEIGHT,
            game_states['player2']['paddle_player2'] + game_states['player2']['dir'] * PADDLE_SPEED * DELTA_TIME
        )
    )
        return right_paddle_y
    
    async def Update_ball_position(self, game_states):

        if game_states['ball']['speedX'] == 0.0:
            if (game_states['score_player1'] + game_states['score_player2']) % 2 == 0:
                game_states['ball']['speedX'] = 0.4
            else:
                game_states['ball']['speedX'] = -0.4 
        game_states['ball']['x'] = game_states['ball']['x'] + game_states['ball']['speedX'] * self.ball_speed * DELTA_TIME
        game_states['ball']['y'] = game_states['ball']['y'] + game_states['ball']['speedY'] * self.ball_speed * DELTA_TIME

        next_y = game_states['ball']['y'] + game_states['ball']['speedY'] * self.ball_speed * DELTA_TIME
        next_x = game_states['ball']['x'] + game_states['ball']['speedX'] * self.ball_speed * DELTA_TIME

        # Ball collision with top and bottom
        if next_y <= 0:  # Top collision
            # print("Top collision detected")
            game_states['ball']['y'] = abs(next_y)  # Bounce back from top
            game_states['ball']['speedY'] = abs(game_states['ball']['speedY'])  # Ensure downward movement
        elif next_y >= self.canvas_height - BALL_SIZE:  # Bottom collision
            # print("Bottom collision detected")
            excess = next_y - (self.canvas_height - BALL_SIZE)
            game_states['ball']['y'] = (self.canvas_height - BALL_SIZE) - excess  # Bounce back from bottom
            game_states['ball']['speedY'] = -abs(game_states['ball']['speedY'])  # Ensure upward movement
        else:
            game_states['ball']['y'] = next_y  # No collision, normal movement

        game_states['ball']['x'] = next_x  # Update x position
        # Ball collision with paddles
        
        if (game_states['ball']['x'] <= PADDLE_WIDTH and 
            game_states['ball']['y'] + BALL_SIZE >= game_states['player1']['paddle_player1'] and 
            game_states['ball']['y'] <= game_states['player1']['paddle_player1'] + PADDLE_HEIGHT):

            if(self.ball_speed < 800):
                    # print("ball_speeeeeeeeed :", self.ball_speed)
                    self.ball_speed+= 20
            # print("colide with left paddle")
            game_states['ball']['x'] = PADDLE_WIDTH + 1
            game_states['ball']['speedX'] = -game_states['ball']['speedX']
            # 
            # Calculate new direction (not speed) based on where ball hits paddle
            paddle_center = game_states['player1']['paddle_player1'] + PADDLE_HEIGHT / 2
            hit_position = game_states['ball']['y'] - paddle_center

            # If hit very close to center, randomly choose up or down direction
            if abs(hit_position) < (PADDLE_HEIGHT * 0.1):  # 10% of paddle height as center zone
                import random
                hit_position = random.choice([-1, 1]) * PADDLE_HEIGHT * 0.25  # Force a non-zero angle

            # Calculate new Y direction
            direction_multiplier = hit_position / (PADDLE_HEIGHT / 2)  # -1 to 1
            game_states['ball']['speedY'] = abs(game_states['ball']['speedX']) * direction_multiplier  # Use X speed

        if (game_states['ball']['x'] >= self.canvas_width - PADDLE_WIDTH - BALL_SIZE and 
            game_states['ball']['y'] + BALL_SIZE >= game_states['player2']['paddle_player2'] and 
            game_states['ball']['y'] <= game_states['player2']['paddle_player2'] + PADDLE_HEIGHT):

            if(self.ball_speed < 800):
                    # print("ball_speeeeeeeeed :", self.ball_speed)
                    self.ball_speed+= 20
            # print("colide with right paddle")
            # print(game_states['ball']['x'], game_states['ball']['y'])
            game_states['ball']['x'] = self.canvas_width - PADDLE_WIDTH - BALL_SIZE - 1
            game_states['ball']['speedX'] = -game_states['ball']['speedX']
            paddle_center = game_states['player2']['paddle_player2'] + PADDLE_HEIGHT / 2
            hit_position = game_states['ball']['y'] - paddle_center

        # If hit very close to center, randomly choose up or down direction
            if abs(hit_position) < (PADDLE_HEIGHT * 0.1):  # 10% of paddle height as center zone
                import random
                hit_position = random.choice([-1, 1]) * PADDLE_HEIGHT * 0.25  # Force a non-zero angle

            # Calculate new Y direction
            direction_multiplier = hit_position / (PADDLE_HEIGHT / 2)  # -1 to 1
            game_states['ball']['speedY'] = abs(game_states['ball']['speedX']) * direction_multiplier  # Use X speed

        if (game_states['ball']['x'] <= 0):
            game_states['score_player2'] += 1
            if(game_states['score_player2'] == 7):
                game_states['winner'] = 2
            game_states['ball']['x'] = self.canvas_width / 2
            game_states['ball']['y'] = self.canvas_height / 2
            game_states['ball']['speedX'] = 0.0
            self.ball_speed = 200
            game_states['ball']['speedY'] = 0.0
        elif game_states['ball']['x'] >= self.canvas_width:
            game_states['score_player1'] += 1
            if(game_states['score_player1'] == 7):
                game_states['winner'] = 1
            game_states['ball']['x'] = self.canvas_width / 2
            game_states['ball']['y'] = self.canvas_height / 2
            game_states['ball']['speedX'] = 0.0
            self.ball_speed = 200
            game_states['ball']['speedY'] = 0.0

    async def connect(self):
        try:
            self.user = self.scope['user']
            self.room_group_name = f'room_33'

            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )


            existing_game = await self.get_available_game(self.room_group_name)
            if existing_game is None:
                self.game = await self.create_game(self.room_group_name)
            
            elif await self.check_player1(existing_game) == False:
                self.game = await self.add_player2(existing_game)


                # Get usernames in an async-safe way
                players = await self.get_player_usernames(self.game)

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


            game_states = PongConsumer.game_states[self.room_group_name]

            if not game_states['player1']['connected']:
                self.player_number = 1
                game_states['player1']['connected'] = True
                self.game.player1 = self.user
                print('Player 1 connected')
                await self.send(text_data=json.dumps({
                    'type': 'player_number',
                    'number': 1,
                    'game_state': game_states
                }))

            elif not game_states['player2']['connected'] and self.user != self.game.player1:
                self.player_number = 2
                game_states['player2']['connected'] = True
                game_states['status'] = 'playing'
                self.game.player2 = self.user
                print('Player 2 connected')
                await self.send(text_data=json.dumps({
                    'type': 'player_number',
                    'number': 2,
                    'game_state': game_states
                }))
        except Exception as e:
            print(f"Unexpected error in connect: {str(e)}")
            await self.close()

    async def game_message(self, event):
        await self.send(text_data=json.dumps(event['message']))

    async def disconnect(self, close_code):
        try:
            game_state = PongConsumer.game_states[self.room_group_name]
            game = await self.get_available_game(self.room_group_name)

            # Save the updated state
            if self.player_number == 1:
                loser = self.get_player1(game)
                winner = self.get_player2(game)
                game_state['player1']['connected'] = False
                game_state['winner'] = 2
            else:
                loser = self.get_player2(game)
                winner = self.get_player1(game)
                game_state['player2']['connected'] = False
                game_state['winner'] = 1
            
            await sync_to_async(Game.objects.filter(room_name=self.room_name).update)(
                game_state=game_state, winner=winner, loser=loser
            )
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

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_message',
                    'message': {
                        'type': "end_game",
                        'winner': game_state['winner'],
                    }
                }
            )
        except Exception as e:
            print(f"Error in disconnect: {str(e)}")
            
    async def update_ball_position_interval(self):
        try:
            while True:
                try:
                    game_states = PongConsumer.game_states[self.room_group_name]

                    await self.Update_ball_position(game_states)

                    await self.update_game_state(game_states)

                    new_left_y = await self.new_left_paddle_y(game_states)
                    new_right_y = await self.new_right_paddle_y(game_states)

                    await self.save_paddle_positions(new_left_y, new_right_y, game_states)

                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'game_message',
                            'message': {
                                'type': "ball_position",
                                'newBallX': game_states['ball']['x'],
                                'newBallY': game_states['ball']['y'],
                                'newBallSpeedX': game_states['ball']['speedX'],
                                'newBallSpeedY': game_states['ball']['speedY'],
                                'rightScore': game_states['score_player2'],
                                'leftScore': game_states['score_player1'],
                                'leftPaddleY': game_states['player1']['paddle_player1'],
                                'rightPaddleY': game_states['player2']['paddle_player2']
                            }
                        }
                    )
                    if(game_states['winner']):
                        await self.channel_layer.group_send(
                            self.room_group_name,
                            {
                                'type': 'game_message',
                                'message': {
                                    'type': "end_game",
                                    'winner': game_states['winner'],
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

            if data.get('type') == 'paddle_move':
                keys = data.get('keys')
                Player_Number = data.get('number')

                game_states = PongConsumer.game_states[self.room_group_name]
                player = game_states[f'player{Player_Number}']
                player['input'] = keys

                
        
        except json.JSONDecodeError:
            print("Invalid JSON received")
        except Exception as e:
            print(f"Error processing message: {str(e)}")

    async def game_message(self, data):
        try:
            await self.send(text_data=json.dumps(data['message']))
        except Exception as e:
            print(f"Error sending message: {str(e)}")