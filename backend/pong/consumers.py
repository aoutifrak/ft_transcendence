import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.exceptions import AcceptConnection, DenyConnection, StopConsumer
from channels.generic.websocket import WebsocketConsumer
from channels.db import database_sync_to_async
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

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.canvas_width = 1200
        self.room_name = None 
        self.canvas_height = 700 
        self.ball_update_task = None 
        self.ball_speed = 200
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
            'winerr': 0,              
            'player2': {
                'username': None,
                'dir': 0,    
                'paddle_player2': self.canvas_height / 2 - 50,      
                'connected': False,
                'input': {
                    'up': False,
                    'down': False,
                }
            },              
            'player1': {
                'username': None,
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

    @database_sync_to_async
    def get_available_game(self):
        return Game.objects.filter(room=self.room_group_name).first()

    @database_sync_to_async
    def create_game(self, room_name):
        game_state = self.create_initial_game_state()
        PongConsumer.game_states[room_name] = game_state
        return Game.objects.create(room=room_name, game_state=game_state, player1=self.user, player2=None)
    
    @database_sync_to_async
    def add_player2(self, game):
        game.player2 = self.user
        game.save()
        return game

        
    @database_sync_to_async
    def change_state(self, user, state):
        user.on_game = state
        user.save()


    @database_sync_to_async
    def check_player1(self, game):
        return game.player1 == self.user

    @database_sync_to_async
    def get_game(self):
        try:
            return Game.objects.get(id=self.game.id)
        except Game.DoesNotExist:
            print(f"Game with ID {self.game.id} not found")
            return None
    
    @database_sync_to_async
    def get_player_usernames(self, game):
        return {
            'player1': game.player1.username,
            'player2': game.player2.username if game.player2 else None
        }
    
    @database_sync_to_async
    def get_usernames(self):
        if not self.game:
            return None, None
        player1_username = self.game.player1.username if self.game.player1 else None
        player2_username = self.game.player2.username if self.game.player2 else None
        return player1_username, player2_username
    
    #====================================
    @database_sync_to_async
    def get_level(self, player_username):
        return User.objects.filter(username=player_username).values('level', 'score', 'wins', 'losses').first()
    
    @database_sync_to_async
    def add_losses(self, player_username, losses):
        User.objects.filter(username=player_username).update(
            losses=losses,
            last_game="lose"
        )

    @database_sync_to_async
    def add_level(self, player_username, new_level, new_score, wins, medal):
        User.objects.filter(username=player_username).update(
            level=new_level,
            score=new_score,
            wins=wins,
            last_game="win",
            medal=medal
        )

    @database_sync_to_async
    def update_users_rank(self):
        users = User.objects.order_by('-score')
        rank = 1

        for user in users:
            user.rank = rank
            user.save()
            rank += 1

    @database_sync_to_async
    def update_game_winner(self, winner_username, loser_username):
        Game.objects.filter(room=self.room_group_name).update(
            winner=winner_username,
            loser=loser_username
        )

    @database_sync_to_async
    def save_game_state(self):
        Game.objects.filter(room=self.room_group_name).update(
            game_state=PongConsumer.game_states[self.room_group_name]
        )
    @database_sync_to_async
    def get_player1(self, game):
        return game.player1
    
    @database_sync_to_async
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

        if next_y <= 0:
            game_states['ball']['y'] = abs(next_y)
            game_states['ball']['speedY'] = abs(game_states['ball']['speedY']) 
        elif next_y >= self.canvas_height - BALL_SIZE:
            excess = next_y - (self.canvas_height - BALL_SIZE)
            game_states['ball']['y'] = (self.canvas_height - BALL_SIZE) - excess
            game_states['ball']['speedY'] = -abs(game_states['ball']['speedY'])
        else:
            game_states['ball']['y'] = next_y

        game_states['ball']['x'] = next_x
        
        if (game_states['ball']['x'] <= PADDLE_WIDTH and 
            game_states['ball']['y'] + BALL_SIZE >= game_states['player1']['paddle_player1'] and 
            game_states['ball']['y'] <= game_states['player1']['paddle_player1'] + PADDLE_HEIGHT):

            if(self.ball_speed < 800):
                self.ball_speed = self.ball_speed + 40
            game_states['ball']['x'] = PADDLE_WIDTH + 1
            game_states['ball']['speedX'] = -game_states['ball']['speedX']

            paddle_center = game_states['player1']['paddle_player1'] + PADDLE_HEIGHT / 2
            hit_position = game_states['ball']['y'] - paddle_center

            if abs(hit_position) < (PADDLE_HEIGHT * 0.1):
                import random
                hit_position = random.choice([-1, 1]) * PADDLE_HEIGHT * 0.25 

            direction_multiplier = hit_position / (PADDLE_HEIGHT / 2) 
            game_states['ball']['speedY'] = abs(game_states['ball']['speedX']) * direction_multiplier  

        if (game_states['ball']['x'] >= self.canvas_width - PADDLE_WIDTH - BALL_SIZE and 
            game_states['ball']['y'] + BALL_SIZE >= game_states['player2']['paddle_player2'] and 
            game_states['ball']['y'] <= game_states['player2']['paddle_player2'] + PADDLE_HEIGHT):

            if(self.ball_speed < 800):
                self.ball_speed = self.ball_speed + 40
            game_states['ball']['x'] = self.canvas_width - PADDLE_WIDTH - BALL_SIZE - 1
            game_states['ball']['speedX'] = -game_states['ball']['speedX']
            paddle_center = game_states['player2']['paddle_player2'] + PADDLE_HEIGHT / 2
            hit_position = game_states['ball']['y'] - paddle_center

            if abs(hit_position) < (PADDLE_HEIGHT * 0.1):
                import random
                hit_position = random.choice([-1, 1]) * PADDLE_HEIGHT * 0.25 

            direction_multiplier = hit_position / (PADDLE_HEIGHT / 2)
            game_states['ball']['speedY'] = abs(game_states['ball']['speedX']) * direction_multiplier  

        if (game_states['ball']['x'] <= 0):
            game_states['score_player2'] += 1
            if(game_states['score_player2'] == 7):
                game_states['winerr'] = 2

            game_states['ball']['x'] = self.canvas_width / 2
            game_states['ball']['y'] = self.canvas_height / 2
            game_states['ball']['speedX'] = 0.0
            self.ball_speed = 200
            game_states['ball']['speedY'] = 0.0

            
        elif game_states['ball']['x'] >= self.canvas_width:
            game_states['score_player1'] += 1
            if(game_states['score_player1'] == 7):
                game_states['winerr'] = 1
            game_states['ball']['x'] = self.canvas_width / 2
            game_states['ball']['y'] = self.canvas_height / 2
            game_states['ball']['speedX'] = 0.0
            self.ball_speed = 200
            game_states['ball']['speedY'] = 0.0


    async def connect(self):
        try:
            self.game_id = self.scope['url_route']['kwargs']['game_id']
            self.user = self.scope['user']
            self.room_group_name = f'game_id_{self.game_id}'
            self.flag = 0

            await self.change_state(self.scope['user'],True)


            print("game_id: ", self.game_id)

            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            if self.room_group_name not in PongConsumer.game_states:
                self.game = await self.create_game(self.room_group_name)
                if self.game.winner != 'Unknown':
                    self.game = await self.create_game(self.room_group_name)
            else:
                existing_game = await self.get_available_game()
                if await self.check_player1(existing_game) == False:                    
                    self.game = await self.add_player2(existing_game)
                self.game = existing_game
                players = await self.get_player_usernames(self.game)
                if PongConsumer.game_states[self.room_group_name]['winerr']:
                    self.flag = 1

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

            if self.user == self.game.player1:
                self.player_number = 1
                game_states['player1']['username'] = self.user.username
                self.game.player1 = self.user
                await self.send(text_data=json.dumps({
                    'type': 'player_number',
                    'number': 1,
                    'game_state': game_states
                }))
            elif self.user == self.game.player2:
                self.player_number = 2
                game_states['player2']['username'] = self.user.username
                game_states['status'] = 'playing'
                self.game.player2 = self.user
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
        await sync_to_async(self.scope['user'].refresh_from_db)()
        try:
            game_state = PongConsumer.game_states[self.room_group_name]
            game = await self.get_available_game()
            await self.change_state(self.scope['user'],False)

            winner = None
            if self.player_number == 1 and game_state['winerr'] == 0:
                loser = self.get_player1(game)
                winner = self.get_player2(game)
                game_state['winerr'] = 2
                self.game = await self.get_available_game()
                player1_username, player2_username = await self.get_usernames()
                await self.update_game_winner(player2_username, player1_username)
                await self.save_game_state()
                info  = await self.get_level(player2_username)
                info2  = await self.get_level(player1_username)
                level = info['level'] + 1
                score = info['score'] + 100
                wins = info['wins'] + 1
                losses = info2['losses'] + 1
                medal = "selverMedalLevel1Icon"

                if level > 10 and level <= 20:
                    medal = "selverMedalLevel2Icon"
                elif level > 20 and level <= 30:
                    medal = "selverMedalLevel3Icon"
                elif level > 30:
                    medal = "goldenMedalIcon"
                await self.add_level(player2_username, level, score, wins, medal)
                await self.update_users_rank()
                await self.add_losses(player1_username, losses)
            elif self.player_number == 2 and game_state['winerr'] == 0:
                loser = self.get_player2(game)
                winner = self.get_player1(game)
                game_state['winerr'] = 1
                self.game = await self.get_available_game()
                player1_username, player2_username = await self.get_usernames()
                await self.update_game_winner(player1_username, player2_username)
                await self.save_game_state()
                info1  = await self.get_level(player1_username)
                info2  = await self.get_level(player2_username)
                level = info1['level'] + 1
                score = info1['score'] + 100
                wins = info1['wins'] + 1
                losses = info2['losses'] + 1
                medal = "selverMedalLevel1Icon"

                if level > 10 and level <= 20:
                    medal = "selverMedalLevel2Icon"
                elif level > 20 and level <= 30:
                    medal = "selverMedalLevel3Icon"
                elif level > 30:
                    medal = "goldenMedalIcon"
                await self.add_level(player1_username, level, score, wins, medal)
                await self.update_users_rank()
                await self.add_losses(player2_username, losses)
                
            if game_state['winerr'] and winner:
                await sync_to_async(Game.objects.filter(room=self.room_name).update)(
                    game_state=game_state, winner=winner, loser=loser
                )

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
                        'winner': game_state['winerr'],
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
                                'rightPaddleY': game_states['player2']['paddle_player2'],
                                'name1': game_states['player1']['username'],
                                'name2': game_states['player2']['username']

                            }
                        }
                    )
                    if(game_states['winerr']):
                        if game_states['winerr'] == 1 and self.flag == 0:
                            self.game = await self.get_available_game()
                            player1_username, player2_username = await self.get_usernames()
                            await self.update_game_winner(player1_username, player2_username)
                            await self.save_game_state()
                            info1  = await self.get_level(player1_username)
                            info2  = await self.get_level(player2_username)
                            level = info1['level'] + 1
                            score = info1['score'] + 100
                            wins = info1['wins'] + 1
                            losses = info2['losses'] + 1
                            medal = "selverMedalLevel1Icon"

                            if level > 10 and level <= 20:
                                medal = "selverMedalLevel2Icon"
                            elif level > 20 and level <= 30:
                                medal = "selverMedalLevel3Icon"
                            elif level > 30:
                                medal = "goldenMedalIcon"

                            await self.add_level(player1_username, level, score, wins, medal)
                            await self.update_users_rank()
                            await self.add_losses(player2_username, losses)
                        elif game_states['winerr'] == 2 and self.flag == 0:
                            self.game = await self.get_available_game()
                            player1_username, player2_username = await self.get_usernames()
                            await self.update_game_winner(player2_username, player1_username)
                            await self.save_game_state()
                            info  = await self.get_level(player2_username)
                            info2  = await self.get_level(player1_username)
                            level = info['level'] + 1
                            score = info['score'] + 100
                            wins = info['wins'] + 1
                            losses = info2['losses'] + 1
                            medal = "selverMedalLevel1Icon"

                            if level > 10 and level <= 20:
                                medal = "selverMedalLevel2Icon"
                            elif level > 20 and level <= 30:
                                medal = "selverMedalLevel3Icon"
                            elif level > 30:
                                medal = "goldenMedalIcon"

                            await self.add_level(player2_username, level, score, wins, medal)
                            await self.update_users_rank()
                            await self.add_losses(player1_username, losses)
                        await self.channel_layer.group_send(
                            self.room_group_name,
                            {
                                'type': 'game_message',
                                'message': {
                                    'type': "end_game",
                                    'winner': game_states['winerr'],
                                }
                            }
                        )
                        break;

                    await asyncio.sleep(0.01)

                except Exception as e:
                    print(f"Error in ball update loop: {str(e)}")
                    await asyncio.sleep(1)

        except asyncio.CancelledError:
            print("Ball update task cancelled")
            raise
        except Exception as e:
            print(f"Fatal error in ball update task: {str(e)}")

    async def receive(self, text_data):
        await sync_to_async(self.scope['user'].refresh_from_db)()
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