# Generated by Django 4.2.16 on 2024-12-28 03:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pong', '0007_alter_game_player1'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='room',
            field=models.CharField(blank=True, max_length=25),
        ),
    ]