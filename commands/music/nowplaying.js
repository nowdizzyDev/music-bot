'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { useQueue, useTimeline } = require('discord-player');
const { buildNowPlayingUI, buildInfoUI } = require('../handlers/playerUI');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Şu an çalan şarkıyı gösterir'),

  async execute(interaction) {
    const queue = useQueue(interaction.guild);
    if (!queue?.currentTrack) return interaction.reply(buildInfoUI('warning', 'Çalmıyor', 'Şu an çalan bir şarkı yok.'));

    const timeline = useTimeline(interaction.guild);
    const position = timeline?.timestamp?.current?.value ?? 0;

    return interaction.reply(
      buildNowPlayingUI(queue.currentTrack, queue, {
        isPaused:  queue.node.isPaused(),
        loopMode:  queue.repeatMode,
        volume:    queue.node.volume,
        position,
      })
    );
  },
};
