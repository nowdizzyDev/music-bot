'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { useQueue }            = require('discord-player');
const { buildInfoUI }         = require('../handlers/playerUI');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Sıradan bir şarkıyı kaldırır')
    .addIntegerOption((o) =>
      o.setName('pozisyon')
        .setDescription('Sıradaki şarkı numarası (/queue ile görebilirsin)')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {
    const queue = useQueue(interaction.guild);
    if (!queue?.tracks.size) return interaction.reply(buildInfoUI('warning', 'Boş Sıra', 'Sırada kaldırılacak şarkı yok.'));
    if (!inSameVoice(interaction)) return interaction.reply(buildInfoUI('error', 'Kanal Hatası', 'Botla aynı ses kanalında değilsin!'));

    const pos   = interaction.options.getInteger('pozisyon', true);
    const track = queue.tracks.at(pos - 1);

    if (!track) {
      return interaction.reply(
        buildInfoUI('error', 'Geçersiz Pozisyon', `Sıra ${queue.tracks.size} şarkı içeriyor. 1–${queue.tracks.size} arası bir değer gir.`)
      );
    }

    queue.tracks.remove(track);
    return interaction.reply(buildInfoUI('success', 'Kaldırıldı', `**${track.title}** sıradan kaldırıldı.`));
  },
};

function inSameVoice(i) {
  const bot  = i.guild.members.me?.voice?.channel;
  const user = i.member?.voice?.channel;
  return bot && user && bot.id === user.id;
}
