'use strict';

const { SlashCommandBuilder }      = require('discord.js');
const { useQueue, QueueRepeatMode } = require('discord-player');
const { buildInfoUI }              = require('../handlers/playerUI');
const emojis                       = require('../../emoji.json');

const MODES = {
  off:   { value: QueueRepeatMode.OFF,   label: 'Kapalı',    emoji: emojis.loopOff },
  track: { value: QueueRepeatMode.TRACK, label: 'Tek Şarkı', emoji: emojis.loopTrack },
  queue: { value: QueueRepeatMode.QUEUE, label: 'Sıra',      emoji: emojis.loop },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Döngü modunu ayarlar')
    .addStringOption((o) =>
      o.setName('mod').setDescription('Döngü modu').setRequired(true)
        .addChoices(
          { name: '🔁 Sırayı Döngüye Al', value: 'queue' },
          { name: '🔂 Şarkıyı Döngüye Al', value: 'track' },
          { name: '➡️ Döngüyü Kapat',      value: 'off'   }
        )
    ),

  async execute(interaction) {
    const queue = useQueue(interaction.guild);
    if (!queue) return interaction.reply(buildInfoUI('warning', 'Kuyruk Yok', 'Aktif bir müzik kuyruğu yok.'));
    if (!inSameVoice(interaction)) return interaction.reply(buildInfoUI('error', 'Kanal Hatası', 'Botla aynı ses kanalında değilsin!'));

    const mode = MODES[interaction.options.getString('mod', true)];
    queue.setRepeatMode(mode.value);
    return interaction.reply(buildInfoUI('success', 'Döngü Modu', `${mode.emoji} Döngü modu: **${mode.label}**`));
  },
};

function inSameVoice(i) {
  const bot  = i.guild.members.me?.voice?.channel;
  const user = i.member?.voice?.channel;
  return bot && user && bot.id === user.id;
}
