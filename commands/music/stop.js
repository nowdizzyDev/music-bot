'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { useQueue }            = require('discord-player');
const { buildInfoUI }         = require('../handlers/playerUI');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Müziği durdurur ve ses kanalından ayrılır'),

  async execute(interaction) {
    const queue = useQueue(interaction.guild);
    if (!queue) return interaction.reply(buildInfoUI('warning', 'Çalmıyor', 'Şu an aktif bir kuyruk yok.'));
    if (!inSameVoice(interaction)) return interaction.reply(buildInfoUI('error', 'Kanal Hatası', 'Botla aynı ses kanalında değilsin!'));

    queue.delete();
    return interaction.reply(buildInfoUI('success', 'Durduruldu', 'Sıra temizlendi ve ses kanalından ayrıldım.'));
  },
};

function inSameVoice(i) {
  const bot  = i.guild.members.me?.voice?.channel;
  const user = i.member?.voice?.channel;
  return bot && user && bot.id === user.id;
}
