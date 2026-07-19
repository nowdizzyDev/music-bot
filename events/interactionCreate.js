'use strict';

const { buildInfoUI } = require('../handlers/playerUI');
const handleButtons   = require('../handlers/buttonHandler');

module.exports = {
  name: 'interactionCreate',
  once: false,

  async execute(interaction, client) {

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await client.player.context.provide(
          { guild: interaction.guild },
          () => command.execute(interaction, client)
        );
      } catch (err) {
        console.error(`[Interaction] /${interaction.commandName} hatası:`, err);
        const ui = buildInfoUI('error', 'Bir Hata Oluştu', `\`${err.message || 'Bilinmeyen hata'}\``);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(ui).catch(() => null);
        } else {
          await interaction.reply(ui).catch(() => null);
        }
      }
      return;
    }

    if (interaction.isButton()) {
      const id = interaction.customId;

      if (id === 'settings_reset') {
        const { resetSettings } = require('../handlers/settingsManager');
        const { buildSettingsPanel } = require('../commands/music/settings');
        resetSettings(interaction.guildId);
        return interaction.update(buildSettingsPanel(interaction.guildId));
      }

      if (id.startsWith('music_')) {
        try {
          await client.player.context.provide(
            { guild: interaction.guild },
            () => handleButtons(interaction, client)
          );
        } catch (err) {
          console.error(`[Button] ${id} hatası:`, err);
          await interaction.reply(buildInfoUI('error', 'Hata', err.message)).catch(() => null);
        }
      }
      return;
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'music_search_select') {
      await interaction.deferUpdate();

      const { getSearchCache }                    = require('../commands/music/play');
      const { buildInfoUI, buildAddedToQueueUI }  = require('../handlers/playerUI');
      const { getSettings }                       = require('../handlers/settingsManager');
      const { useMainPlayer }                     = require('discord-player');

      const cache = getSearchCache().get(interaction.guildId);
      if (!cache) {
        return interaction.editReply(buildInfoUI('error', 'Süre Doldu', 'Arama sonuçları zaman aşımına uğradı. Tekrar `/play` kullan.'));
      }

      const index            = parseInt(interaction.values[0]);
      const track            = cache.tracks[index];
      const { voiceChannel } = cache;

      clearTimeout(cache.timer);
      getSearchCache().delete(interaction.guildId);

      if (!track) {
        return interaction.editReply(buildInfoUI('error', 'Hata', 'Seçilen şarkı bulunamadı.'));
      }

      const player   = useMainPlayer();
      const settings = getSettings(interaction.guildId);

      try {
        const { track: addedTrack, queue } = await player.play(voiceChannel, track, {
          nodeOptions: {
            metadata: {
              textChannel:       interaction.channel,
              nowPlayingMessage: null,
            },
            volume:               settings.volume,
            leaveOnEmpty:         settings.leaveOnEmpty,
            leaveOnEmptyCooldown: settings.leaveOnEmptyCooldown,
            leaveOnEnd:           settings.leaveOnEnd,
            leaveOnEndCooldown:   settings.leaveOnEndCooldown,
            selfDeaf:             settings.selfDeaf,
          },
          requestedBy: interaction.user,
        });

        const position = queue.tracks.size;
        return interaction.editReply(
          buildAddedToQueueUI(addedTrack, position === 0 ? 'Hemen çalınıyor' : `#${position}`)
        );
      } catch (err) {
        console.error('[SearchSelect] HATA:', err.message);
        return interaction.editReply(buildInfoUI('error', 'Oynatma Hatası', err.message ?? 'Bilinmeyen bir hata oluştu.'));
      }
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'settings_select_key') {
      const key = interaction.values[0];
      const { buildSettingModal } = require('../commands/music/settings');
      return interaction.showModal(buildSettingModal(key));
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('settings_modal_')) {
      const key      = interaction.customId.replace('settings_modal_', '');
      const rawValue = interaction.fields.getTextInputValue('settings_modal_value');

      const { validateSetting, setSetting } = require('../handlers/settingsManager');
      const { buildSettingsPanel }          = require('../commands/music/settings');

      const result = validateSetting(key, rawValue);
      if (!result.valid) {
        return interaction.reply(buildInfoUI('error', 'Geçersiz Değer', result.error));
      }

      setSetting(interaction.guildId, key, result.parsed);
      return interaction.update(buildSettingsPanel(interaction.guildId));
    }
  },
};
