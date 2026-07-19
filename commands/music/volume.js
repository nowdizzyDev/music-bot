'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { useQueue }            = require('discord-player');
const { buildInfoUI }         = require('../handlers/playerUI');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Ses seviyesini ayarlar veya gösterir')
    .addIntegerOption((o) =>
      o.setName('seviye').setDescription('Ses seviyesi (0–150)').setMinValue(0).setMaxValue(150)
    ),

  async execute(interaction) {
    const queue = useQueue(interaction.guild);
    if (!queue?.currentTrack) return interaction.reply(buildInfoUI('warning', 'Çalmıyor', 'Şu an çalan bir şarkı yok.'));

    const level = interaction.options.getInteger('seviye');
    if (level === null) {
      return interaction.reply(buildInfoUI('info', 'Ses Seviyesi', `Şu anki ses: **${queue.node.volume}%**`));
    }

    if (!inSameVoice(interaction)) return interaction.reply(buildInfoUI('error', 'Kanal Hatası', 'Botla aynı ses kanalında değilsin!'));

    queue.node.setVolume(level);
    const emoji = level === 0 ? '🔇' : level < 50 ? '🔉' : '🔊';
    return interaction.reply(buildInfoUI('success', 'Ses Ayarlandı', `${emoji} Ses seviyesi **${level}%** olarak ayarlandı.`));
  },
};

function inSameVoice(i) {
  const bot  = i.guild.members.me?.voice?.channel;
  const user = i.member?.voice?.channel;
  return bot && user && bot.id === user.id;
}
