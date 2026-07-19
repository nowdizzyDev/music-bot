'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { useQueue }            = require('discord-player');
const { buildInfoUI }         = require('../handlers/playerUI');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Şu anki şarkıyı atlar')
    .addIntegerOption((o) =>
      o.setName('adet').setDescription('Kaç şarkı atlanacak? (varsayılan: 1)').setMinValue(1).setMaxValue(20)
    ),

  async execute(interaction) {
    const queue = useQueue(interaction.guild);
    if (!queue?.isPlaying()) return interaction.reply(buildInfoUI('warning', 'Çalmıyor', 'Şu an çalan bir şarkı yok.'));
    if (!inSameVoice(interaction)) return interaction.reply(buildInfoUI('error', 'Kanal Hatası', 'Botla aynı ses kanalında değilsin!'));

    const amount       = interaction.options.getInteger('adet') ?? 1;
    const skippedTitle = queue.currentTrack?.title ?? 'Bilinmiyor';

    if (amount > 1) {
      for (let i = 0; i < amount - 1; i++) {
        if (queue.tracks.size > 0) queue.tracks.remove(0);
      }
    }
    queue.node.skip();

    return interaction.reply(
      buildInfoUI('success', 'Atlandı', `**${skippedTitle}**${amount > 1 ? ` (+${amount - 1} şarkı)` : ''} atlandı.`)
    );
  },
};

function inSameVoice(i) {
  const bot  = i.guild.members.me?.voice?.channel;
  const user = i.member?.voice?.channel;
  return bot && user && bot.id === user.id;
}
