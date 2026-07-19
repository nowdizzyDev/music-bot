'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer }       = require('discord-player');
const { buildInfoUI, buildSearchResultsUI } = require('../handlers/playerUI');
const { getSettings } = require('../../handlers/settingsManager');

const searchCache = new Map();

function getSearchCache() { return searchCache; }

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Şarkı arar, sonuçları listeler — seç ve çal')
    .addStringOption((o) =>
      o.setName('sorgu')
        .setDescription('Şarkı adı veya URL (YouTube, SoundCloud…)')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const voiceChannel = interaction.member?.voice?.channel;
    if (!voiceChannel) {
      return interaction.editReply(buildInfoUI('error', 'Ses Kanalı Yok', 'Önce bir ses kanalına katılman gerekiyor!'));
    }

    const perms = voiceChannel.permissionsFor(interaction.guild.members.me);
    if (!perms.has('Connect') || !perms.has('Speak')) {
      return interaction.editReply(buildInfoUI('error', 'İzin Hatası', 'Ses kanalına bağlanma veya konuşma iznim yok!'));
    }

    const query  = interaction.options.getString('sorgu', true);
    const player = useMainPlayer();

    try {
      const results = await player.search(query, { requestedBy: interaction.user });

      if (!results.hasTracks()) {
        return interaction.editReply(buildInfoUI('error', 'Sonuç Bulunamadı', `**"${query}"** için hiç sonuç bulunamadı.`));
      }

      const tracks = results.tracks.slice(0, 10);

      const existing = searchCache.get(interaction.guildId);
      if (existing) {
        clearTimeout(existing.timer);
        searchCache.delete(interaction.guildId);
      }

      const timer = setTimeout(() => {
        searchCache.delete(interaction.guildId);
      }, 60_000);

      searchCache.set(interaction.guildId, { tracks, voiceChannel, timer });

      return interaction.editReply(buildSearchResultsUI(query, tracks));
    } catch (err) {
      console.error('[Play] HATA:', err.message);
      return interaction.editReply(buildInfoUI('error', 'Arama Hatası', err.message ?? 'Bilinmeyen bir hata oluştu.')).catch(() => null);
    }
  },

  getSearchCache,
};
