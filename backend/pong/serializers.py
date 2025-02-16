from rest_framework import serializers
from .models import Game

class GameSerializer(serializers.ModelSerializer):
    player1 = serializers.SerializerMethodField()
    player2 = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = ['player1', 'player2']

    def get_player1(self, obj):
        game_state = obj.get_game_state()
        return {
            'name': obj.player1.username,
            'avatar': obj.player1.avatar.url,
            'scored': game_state['score_player1'],
            'winner': obj.winner,
            'loser': obj.loser,
            'updated_at': obj.updated_at,
            'type': "pong"
        }

    def get_player2(self, obj):
        game_state = obj.get_game_state()
        return {
            'name': obj.player2.username,
            'avatar': obj.player2.avatar.url,
            'scored': game_state['score_player2'],
            'winner': obj.winner,
            'loser': obj.loser,
            'updated_at': obj.updated_at,
            'type': "pong"
        }
