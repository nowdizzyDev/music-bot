'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { useQueue }            = require('discord-player');
const { buildInfoUI }         = require('../handlers/playerUI');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Çalmayı duraklatır'),

  async execute(interaction) {
    const queue = useQueue(interaction.guild);
    if (!queue?.isPlaying()) return interaction.reply(buildInfoUI('warning', 'Çalmıyor', 'Şu an çalan bir şarkı yok.'));
    if (!inSameVoice(interaction)) return interaction.reply(buildInfoUI('error', 'Kanal Hatası', 'Botla aynı ses kanalında değilsin!'));
    if (queue.node.isPaused()) return interaction.reply(buildInfoUI('warning', 'Zaten Duraklatıldı', '`/resume` ile devam et.'));

    queue.node.pause();
    return interaction.reply(buildInfoUI('success', 'Duraklatıldı', `**${queue.currentTrack.title}** duraklatıldı.`));
  },
};

function inSameVoice(i) {
  const bot  = i.guild.members.me?.voice?.channel;
  const user = i.member?.voice?.channel;
  return bot && user && bot.id === user.id;
}
