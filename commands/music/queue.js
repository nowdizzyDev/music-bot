'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { useQueue }            = require('discord-player');
const { buildQueueUI, buildInfoUI } = require('../handlers/playerUI');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Şarkı sırasını gösterir')
    .addIntegerOption((o) =>
      o.setName('sayfa').setDescription('Sayfa numarası').setMinValue(1)
    ),

  async execute(interaction) {
    const queue = useQueue(interaction.guild);
    if (!queue?.currentTrack) return interaction.reply(buildInfoUI('warning', 'Boş Sıra', 'Şu an çalan bir şarkı yok.'));

    const page = interaction.options.getInteger('sayfa') ?? 1;
    return interaction.reply(buildQueueUI(queue, page));
  },
};
