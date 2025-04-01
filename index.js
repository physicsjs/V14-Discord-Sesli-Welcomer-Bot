const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const botToken = process.env.TOKEN;
const targetChannelId = process.env.CHANNEL_ID;
const audioFilePath = process.env.SES_DOSYASI;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`${client.user.tag} olarak giriş yaptı!`);
});


client.on('voiceStateUpdate', async (oldState, newState) => {
  if (newState.channel && newState.channel.id === targetChannelId && !oldState.channel) {
    const connection = joinVoiceChannel({
      channelId: newState.channel.id,
      guildId: newState.guild.id,
      adapterCreator: newState.guild.voiceAdapterCreator,
    });
    const resource = createAudioResource(fs.createReadStream(path.join(__dirname, audioFilePath)));
    const player = createAudioPlayer();

    connection.subscribe(player);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

    console.log(`${newState.member.user.tag} ${newState.channel.name} kanalına katıldı`);
  }
});

client.login(botToken);
