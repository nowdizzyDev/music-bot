'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { useQueue }            = require('discord-player');
const { buildInfoUI }         = require('../handlers/playerUI');
const emojis                  = require('../../emoji.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Sıradaki şarkıları karıştırır'),

  async execute(interaction) {
    const queue = useQueue(interaction.guild);
    if (!queue?.tracks.size) return interaction.reply(buildInfoUI('warning', 'Boş Sıra', 'Sırada karıştırılacak şarkı yok.'));
    if (!inSameVoice(interaction)) return interaction.reply(buildInfoUI('error', 'Kanal Hatası', 'Botla aynı ses kanalında değilsin!'));

    queue.tracks.shuffle();
    return interaction.reply(
      buildInfoUI('success', 'Karıştırıldı', `${emojis.shuffle} Sıradaki **${queue.tracks.size}** şarkı karıştırıldı.`)
    );
  },
};

function inSameVoice(i) {
  const bot  = i.guild.members.me?.voice?.channel;
  const user = i.member?.voice?.channel;
  return bot && user && bot.id === user.id;
}
