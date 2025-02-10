import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
import asyncio
from datetime import datetime
from .models import Game
from profiles.models import User
import math
import time

class GameConsumer(AsyncWebsocketConsumer):

    game_state = {}
    game_loops = {}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.game_group_name = None
        self.game_id = None
        self.player_number = None
        
    def create_initial_game_state(self):
        return {
            'canvasWidth': 800,
            'canvasHeight': 500,
            'playerWidth': 40,
            'playerHeight': 40,
            'rotationSpeed': 3,
            'moveSpeed': 5,
            'player1': {
                'username': None,
                'x': 50,
                'y': 210,  # (500/2) - (40/2)
                'angle': 0,
                'speed': 5,
                'connected': False,
                'input': {
                    'move': False,
                    'left': False,
                    'right': False,
                    'shoot': False
                }
            },
            'player2': {
                'username': None,
                'x': 730,  # 800 - 70
                'y': 210,  # (500/2) - (40/2)
                'angle': 180,
                'speed': 5,
                'connected': False,
                'input': {
                    'move': False,
                    'left': False,
                    'right': False,
                    'shoot': False
                }
            },
            'ball': {
                'x': 400,  # 800/2
                'y': 250,  # 500/2
                'radius': 10,
                'speedX': 0,
                'speedY': 0,
                'attachedTo': None
            },
            'score': {
                'player1': 0,
                'player2': 0
            },
            'winner': 0,
            'status': 'waiting'  # waiting, playing, finished
        }

    @database_sync_to_async
    def get_available_game(self):
        return Game.objects.filter(room_name=self.game_group_name).first()

    @database_sync_to_async
    def create_game(self, game_group_name):
        game_state = self.create_initial_game_state()
        GameConsumer.game_state[game_group_name] = game_state
        return Game.objects.create(room_name=game_group_name, game_state=game_state, player1=self.user)

    @database_sync_to_async
    def add_player2(self):
        Game.objects.filter(room_name=self.game_group_name).update(
            player2=self.user
        )
        self.game.player2 = self.user
        self.game.save()

    @database_sync_to_async
    def get_player1(self):
        return self.game.player1 if self.game else None
    
    @database_sync_to_async
    def get_player2(self):
        return self.game.player2 if self.game else None

    @database_sync_to_async
    def get_player_usernames(self):
        if not self.game:
            return None, None
        player1_username = self.game.player1.username if self.game.player1 else None
        player2_username = self.game.player2.username if self.game.player2 else None
        return player1_username, player2_username

    @database_sync_to_async
    def get_level(self, player_username):
        return User.objects.filter(username=player_username).values('level', 'score', 'league_wins', 'league_losses').first()

    @database_sync_to_async
    def update_users_rank(self):
        users = User.objects.order_by('-score')
        rank = 1

        for user in users:
            user.rank = rank
            user.save()
            rank += 1

        

    @database_sync_to_async
    def add_losses(self, player_username, losses):
        User.objects.filter(username=player_username).update(
            league_losses=losses,
            last_game="lose"
        )

    @database_sync_to_async
    def add_level(self, player_username, new_level, new_score, wins, medal):
        User.objects.filter(username=player_username).update(
            level=new_level,
            score=new_score,
            league_wins=wins,
            last_game="win",
            medal=medal
        )

    @database_sync_to_async
    def update_game_winner(self, winner_username, loser_username):
        Game.objects.filter(room_name=self.game_group_name).update(
            winner=winner_username,
            loser=loser_username
        )

    @database_sync_to_async
    def save_game_state(self):
        Game.objects.filter(room_name=self.game_group_name).update(
            game_state=GameConsumer.game_state[self.game_group_name]
        )

    def get_ball_position_for_player(self, player, offset_distance, ball):
        
        radians = (player['angle'] * math.pi) / 180
        ball_x = (player['x'] + self.game_state[self.game_group_name]['playerWidth'] / 2 + 
                 math.cos(radians) * offset_distance)
        ball_y = (player['y'] + self.game_state[self.game_group_name]['playerHeight'] / 2 + 
                 math.sin(radians) * offset_distance)
        ball['x'] = ball_x
        ball['y'] = ball_y
    
    def check_collision(self, ball, player, game_state):

        player_center_x = player['x'] + game_state['playerWidth'] / 2
        player_center_y = player['y'] + game_state['playerHeight'] / 2

        distance = math.sqrt(
            math.pow(ball['x'] - player_center_x, 2) + 
            math.pow(ball['y'] - player_center_y, 2)
        )

        return distance < (ball['radius'] + 
                         min(game_state['playerWidth'], game_state['playerHeight']) / 2)
    
    def shoot_ball(self, player, ball):
        shoot_speed = 12
        radians = (player['angle'] * math.pi) / 180
        ball['speedX'] = math.cos(radians) * shoot_speed
        ball['speedY'] = math.sin(radians) * shoot_speed
        ball['attachedTo'] = None

    def between_players(self, player1, player2, ball):
        shoot_speed = 20
        average_angle = (player1['angle'] + player2['angle']) / 2
        radians = (average_angle * math.pi) / 180
        ball['speedX'] = math.cos(radians) * shoot_speed
        ball['speedY'] = math.sin(radians) * shoot_speed
        ball['attachedTo'] = None

    def reset_game(self, game_state):
        game_state['ball']['x'] = 400
        game_state['ball']['y'] = 250
        game_state['ball']['speedX'] = 0
        game_state['ball']['speedY'] = 0
        game_state['ball']['attachedTo'] = None
        game_state['player1']['x'] = 50
        game_state['player1']['y'] = 210
        game_state['player1']['angle'] = 0
        game_state['player1']['speed'] = 5
        game_state['player2']['x'] = 730
        game_state['player2']['y'] = 210
        game_state['player2']['angle'] = 180
        game_state['player2']['speed'] = 5
        game_state['status'] = 'playing'


    async def update_ball(self):
        """Update ball position and handle collisions"""
        game_state = GameConsumer.game_state[self.game_group_name]
        ball = game_state['ball']
        player1 = game_state['player1']
        player2 = game_state['player2']

        # Handle shooting
        if ball['attachedTo'] == 'player1' and player1['input']['shoot']:
            self.shoot_ball(player1, ball)
            player1['speed'] = 5
        elif ball['attachedTo'] == 'player2' and player2['input']['shoot']:
            self.shoot_ball(player2, ball)
            player2['speed'] = 5

        # Check for goals
        goal_height_start = game_state['canvasHeight'] / 2 - 50
        goal_height_end = game_state['canvasHeight'] / 2 + 50

        # Left goal (Player 2 scores)
        if (ball['x'] - ball['radius'] <= 0 and 
            goal_height_start <= ball['y'] <= goal_height_end):
            self.reset_game(game_state)
            game_state['score']['player2'] += 1
            return

        # Right goal (Player 1 scores)
        if (ball['x'] + ball['radius'] >= game_state['canvasWidth'] and 
            goal_height_start <= ball['y'] <= goal_height_end):
            self.reset_game(game_state)
            game_state['score']['player1'] += 1
            return

        # Handle ball attachment and movement
        if ball['attachedTo'] == 'player1':
            if self.check_collision(ball, player2, game_state):
                self.between_players(player1, player2, ball)
                player1['speed'] = 5
                player2['speed'] = 5
            else:
                player1['speed'] = 3
                self.get_ball_position_for_player(player1, 30, ball)
                
        elif ball['attachedTo'] == 'player2':
            if self.check_collision(ball, player1, game_state):
                self.between_players(player1, player2, ball)
                player1['speed'] = 5
                player2['speed'] = 5
            else:
                player2['speed'] = 3
                self.get_ball_position_for_player(player2, 30, ball)


        else:  # Ball is free
            # Update position
            ball['x'] += ball['speedX']
            ball['y'] += ball['speedY']

            # Apply friction
            ball['speedX'] *= 0.995
            ball['speedY'] *= 0.995

            # Handle wall collisions
            if (ball['x'] - ball['radius'] <= 0 or 
                ball['x'] + ball['radius'] >= game_state['canvasWidth']):
                ball['speedX'] *= -0.8
                ball['x'] = max(
                    ball['radius'],
                    min(game_state['canvasWidth'] - ball['radius'], ball['x'])
                )

            if (ball['y'] - ball['radius'] <= 0 or 
                ball['y'] + ball['radius'] >= game_state['canvasHeight']):
                ball['speedY'] *= -0.8
                ball['y'] = max(
                    ball['radius'],
                    min(game_state['canvasHeight'] - ball['radius'], ball['y'])
                )

            # Check player collisions
            if self.check_collision(ball, player1, game_state):
                ball['attachedTo'] = 'player1'
            elif self.check_collision(ball, player2, game_state):
                ball['attachedTo'] = 'player2'    

    async def game_loop(self):
        """Main game loop that updates and broadcasts game state at 60 FPS"""
        try:
            while True:

                game_state = GameConsumer.game_state[self.game_group_name]

                # Update players position
                for player_key in ['player1', 'player2']:
                    player = game_state[player_key]
                    if player['input']['move']:
                        radians = (player['angle'] * 3.141592653589793) / 180
                        dx = player['speed'] * math.cos(radians)
                        dy = player['speed'] * math.sin(radians)
                        new_x = max(0, min(game_state['canvasWidth'] - game_state['playerWidth'], player['x'] + dx))
                        new_y = max(0, min(game_state['canvasHeight'] - game_state['playerHeight'], player['y'] + dy))
                        player['x'] = new_x
                        player['y'] = new_y
                    if player['input']['left']:
                        player['angle'] = (player['angle'] - game_state['rotationSpeed'] + 360) % 360
                    if player['input']['right']:
                        player['angle'] = (player['angle'] + game_state['rotationSpeed'] + 360) % 360
                    
                # Update ball position
                await self.update_ball()
                

                if game_state['score']['player1'] >= 5:
                    game_state['status'] = 'finished'
                    game_state['winner'] = 1
                    self.game = await self.get_available_game()
                    player1_username, player2_username = await self.get_player_usernames()
                    await self.update_game_winner(player1_username, player2_username)
                    await self.save_game_state()

                    info1  = await self.get_level(player1_username)
                    info2  = await self.get_level(player2_username)
                    level = info1['level'] + 1
                    score = info1['score'] + 100
                    wins = info1['league_wins'] + 1
                    medal = "selverMedalLevel1Icon"

                    losses = info2['league_losses'] + 1

                    if level > 10 and level <= 20:
                        medal = "selverMedalLevel2Icon"
                    elif level > 20 and level <= 30:
                        medal = "selverMedalLevel3Icon"
                    elif level > 30:
                        medal = "goldenMedalIcon"

                    await self.add_level(player1_username, level, score, wins, medal)
                    await self.update_users_rank()
                    await self.add_losses(player2_username, losses)

                elif game_state['score']['player2'] >= 5:
                    game_state['status'] = 'finished'
                    game_state['winner'] = 2
                    self.game = await self.get_available_game()
                    player1_username, player2_username = await self.get_player_usernames()
                    await self.update_game_winner(player2_username, player1_username)
                    await self.save_game_state()

                    info  = await self.get_level(player2_username)
                    info2  = await self.get_level(player1_username)
                    level = info['level'] + 1
                    score = info['score'] + 100
                    wins = info['league_wins'] + 1
                    medal = "selverMedalLevel1Icon"

                    losses = info2['league_losses'] + 1

                    if level > 10 and level <= 20:
                        medal = "selverMedalLevel2Icon"
                    elif level > 20 and level <= 30:
                        medal = "selverMedalLevel3Icon"
                    elif level > 30:
                        medal = "goldenMedalIcon"

                    await self.add_level(player2_username, level, score, wins, medal)
                    await self.update_users_rank()
                    await self.add_losses(player1_username, losses)

                # Broadcast the updated state
                await self.channel_layer.group_send(
                    self.game_group_name,
                    {
                        'type': 'send_game_state',
                        'game_state': game_state
                    }
                )
                if game_state['score']['player1'] >= 5 or game_state['score']['player2'] >= 5:
                    break
                # Sleep for approximately 60 FPS (16.67ms)
                await asyncio.sleep(0.01)
        
        except asyncio.CancelledError:
            # Handle cleanup when the game loop is cancelled
            pass

    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.user = self.scope['user']
        self.game_group_name = f'game_{self.game_id}'
        
        # Get or create game state
        if self.game_group_name not in GameConsumer.game_state:
            self.game = await self.create_game(self.game_group_name)
        else:
            self.game = await self.get_available_game()
            if self.game:
                await self.add_player2()
                # Start the game loop for this game
                GameConsumer.game_loops[self.game_group_name] = asyncio.create_task(self.game_loop())

        # Join room group
        await self.channel_layer.group_add(
            self.game_group_name,
            self.channel_name
        )

        await self.accept()
        
        # Get current game state
        game_state = GameConsumer.game_state[self.game_group_name]

        # Get player1 for comparison
        player1 = await self.get_player1()

        # Assign player number
        if not game_state['player1']['connected']:
            self.player_number = 1
            game_state['player1']['connected'] = True
            game_state['player1']['username'] = self.user.username
            self.game.player1 = self.user
            print('Player 1 connected')
            await self.send(text_data=json.dumps({
                'type': 'player_number',
                'number': 1,
            }))

        elif not game_state['player2']['connected'] and self.user != player1:
            self.player_number = 2
            game_state['player2']['connected'] = True
            game_state['player2']['username'] = self.user.username
            self.game.player2 = self.user
            print('Player 2 connected')
            await self.send(text_data=json.dumps({
                'type': 'player_number',
                'number': 2,
            }))

        # If both players are connected, start the game
        if (game_state['player1']['connected'] and 
            game_state['player2']['connected']):
            game_state['status'] = 'playing'

    async def disconnect(self, close_code):
        game_state = GameConsumer.game_state[self.game_group_name]
        self.game = await self.get_available_game()
        
        player1_username, player2_username = await self.get_player_usernames()

        # Update player connection status
        if self.player_number == 1 and player2_username and game_state['winner'] == 0:
            game_state['player1']['connected'] = False
            game_state['winner'] = 2
            await self.update_game_winner(player2_username, player1_username)
            info  = await self.get_level(player2_username)
            info2  = await self.get_level(player1_username)
            level = info['level'] + 1
            score = info['score'] + 100
            wins = info['league_wins'] + 1
            medal = "selverMedalLevel1Icon"

            losses = info2['league_losses'] + 1

            if level > 10 and level <= 20:
                medal = "selverMedalLevel2Icon"
            elif level > 20 and level <= 30:
                medal = "selverMedalLevel3Icon"
            elif level > 30:
                medal = "goldenMedalIcon"

            await self.add_level(player2_username, level, score, wins, medal)
            await self.update_users_rank()
            await self.add_losses(player1_username, losses)
            
        elif self.player_number == 2 and player1_username and game_state['winner'] == 0:
            game_state['player2']['connected'] = False
            game_state['winner'] = 1
            await self.update_game_winner(player1_username, player2_username)
            info1  = await self.get_level(player1_username)
            info2  = await self.get_level(player2_username)
            level = info1['level'] + 1
            score = info1['score'] + 100
            wins = info1['league_wins'] + 1
            medal = "selverMedalLevel1Icon"

            losses = info2['league_losses'] + 1

            if level > 10 and level <= 20:
                medal = "selverMedalLevel2Icon"
            elif level > 20 and level <= 30:
                medal = "selverMedalLevel3Icon"
            elif level > 30:
                medal = "goldenMedalIcon"

            await self.add_level(player1_username, level, score, wins, medal)
            await self.update_users_rank()
            await self.add_losses(player2_username, losses)

        # Save the updated state
        await self.save_game_state()

        # Leave room group
        await self.channel_layer.group_discard(
            self.game_group_name,
            self.channel_name
        )

        # Cancel the game loop
        if self.game_group_name in GameConsumer.game_loops:
            GameConsumer.game_loops[self.game_group_name].cancel()
            del GameConsumer.game_loops[self.game_group_name]
        
        # Broadcast the updated state
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                'type': 'send_game_state',
                'game_state': game_state
            }
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('type')
        playerNum = data.get('player')

        if action == 'input':
            await self.handle_input(playerNum, data.get('keys'))

    async def handle_input(self, player_num, input_state):
        game_state = GameConsumer.game_state[self.game_group_name]
        player = game_state[f'player{player_num}']
        player['input'] = input_state
    
    async def send_game_state(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'game_state': event['game_state']
        }))