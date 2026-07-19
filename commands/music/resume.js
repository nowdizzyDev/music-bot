'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { useQueue }            = require('discord-player');
const { buildInfoUI }         = require('../handlers/playerUI');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Duraklatılmış çalmayı devam ettirir'),

  async execute(interaction) {
    const queue = useQueue(interaction.guild);
    if (!queue) return interaction.reply(buildInfoUI('warning', 'Kuyruk Yok', 'Aktif bir müzik kuyruğu yok.'));
    if (!inSameVoice(interaction)) return interaction.reply(buildInfoUI('error', 'Kanal Hatası', 'Botla aynı ses kanalında değilsin!'));
    if (!queue.node.isPaused()) return interaction.reply(buildInfoUI('warning', 'Devam Ediyor', 'Çalma zaten devam ediyor.'));

    queue.node.resume();
    return interaction.reply(buildInfoUI('success', 'Devam Etti', `**${queue.currentTrack.title}** devam ediyor.`));
  },
};

function inSameVoice(i) {
  const bot  = i.guild.members.me?.voice?.channel;
  const user = i.member?.voice?.channel;
  return bot && user && bot.id === user.id;
}
