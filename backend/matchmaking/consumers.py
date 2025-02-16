from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from .models import Match
import json
import asyncio

# Global queue for all players
matchmaking_queue = []

class MatchmakingConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        """Handle websocket connection"""
        await self.accept()
        self.player_username = None
        self.level = None
        self.matching_task = None    

    async def disconnect(self, close_code):
        """Handle websocket disconnection"""
        global matchmaking_queue

        if self.matching_task:
            self.matching_task.cancel()

        if self.player_username:
            matchmaking_queue = [p for p in matchmaking_queue if p['player_username'] != self.player_username]

    async def receive_json(self, content):
        """Handle incoming messages"""
        message_type = content.get('type')

        if message_type == 'join_matchmaking':
            await self.handle_join_matchmaking(content)

    async def handle_join_matchmaking(self, content):
        """Handle player joining matchmaking queue with automatic sorting"""
        global matchmaking_queue

        self.player_username = content.get('player_username')
        self.level = content.get('level')

        if not self.player_username:
            await self.send_json({
                'type': 'error',
                'message': 'Missing player_username'
            })
            return

        # Create new player entry
        new_player = {
            'player_username': self.player_username,
            'channel_name': self.channel_name,
            'level': self.level,
            'join_time': asyncio.get_event_loop().time()
        }


        for i, player in enumerate(matchmaking_queue):
            if player['player_username'] == self.player_username:
                matchmaking_queue.pop(i)
                break
        # Add player to queue and sort by level
        matchmaking_queue.append(new_player)
        matchmaking_queue.sort(key=lambda x: x['level'])

        # Log current queue state
        queue_state = [
            {'player_username': p['player_username'], 'level': p['level']} 
            for p in matchmaking_queue
        ]
        print(f"Current Queue State: {queue_state}")

        # Start delayed matchmaking task
        self.matching_task = asyncio.create_task(self.delayed_matchmaking())

    async def delayed_matchmaking(self):
        """Repeatedly try to find a match with delay"""
        try:
            while True:
                await asyncio.sleep(5)

                if not any(p['player_username'] == self.player_username for p in matchmaking_queue):
                    break

                match_found = await self.find_match()

                if match_found:
                    break

        except asyncio.CancelledError:
            pass

    @database_sync_to_async
    def create_match(self, player1, player2):
        """Create a new match in the database"""
        match = Match.objects.create(
            player1_username=player1['player_username'],
            player1_level=player1['level'],
            player2_username=player2['player_username'],
            player2_level=player2['level']
        )

        return match.match_id

    async def find_match(self):
        """Match the first two players in queue"""
        global matchmaking_queue

        if len(matchmaking_queue) >= 2:
            player1 = matchmaking_queue[0]
            player2 = matchmaking_queue[1]

            matchmaking_queue = matchmaking_queue[2:]

            # Create match in database
            match_id = await self.create_match(player1, player2)
            print(f"Match_id: {match_id}")

            channel_layer = get_channel_layer()

            await channel_layer.send(player1['channel_name'], {
                'type': 'match_found',
                'match_id': match_id
            })

            await channel_layer.send(player2['channel_name'], {
                'type': 'match_found',
                'match_id': match_id
            })

            return True
        return False

    async def match_found(self, event):
        """Handle match found event"""
        if self.matching_task:
            self.matching_task.cancel()

        await self.send_json({
            'type': 'match_found',
            'match': event['match_id']
        })