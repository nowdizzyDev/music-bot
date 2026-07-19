'use strict';

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ContainerBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonStyle,
  SeparatorSpacingSize,
  MessageFlags,
} = require('discord.js');

const { getSettings, setSetting, resetSettings, validateSetting, DEFAULTS, SCHEMA } = require('../../handlers/settingsManager');
const { buildInfoUI } = require('../handlers/playerUI');
const emojis = require('../../emoji.json');

// ─── Ayar paneli UI ───────────────────────────────────────────────

function buildSettingsPanel(guildId) {
  const cfg = getSettings(guildId);

  const c = new ContainerBuilder();

  // Başlık
  c.addTextDisplayComponents((td) =>
    td.setContent(`## ⚙️ Sunucu Müzik Ayarları`)
  );
  c.addSeparatorComponents((s) => s.setDivider(true).setSpacing(SeparatorSpacingSize.Small));

  // Mevcut değerler
  const lines = Object.entries(SCHEMA).map(([key, rule]) => {
    const val = cfg[key] ?? DEFAULTS[key];
    const display = typeof val === 'boolean'
      ? (val ? '✅ Açık' : '❌ Kapalı')
      : `\`${val}\``;
    return `**${rule.label}** — ${display}`;
  });

  c.addTextDisplayComponents((td) => td.setContent(lines.join('\n')));
  c.addSeparatorComponents((s) => s.setDivider(true).setSpacing(SeparatorSpacingSize.Small));

  // Select menu — hangi ayarı değiştirmek istiyorsun?
  const select = new StringSelectMenuBuilder()
    .setCustomId('settings_select_key')
    .setPlaceholder('✏️ Değiştirmek istediğin ayarı seç…')
    .addOptions(
      Object.entries(SCHEMA).map(([key, rule]) =>
        new StringSelectMenuOptionBuilder()
          .setValue(key)
          .setLabel(rule.label)
          .setDescription(`Şu an: ${formatVal(cfg[key] ?? DEFAULTS[key])}  •  ${rule.hint}`)
      )
    );

  c.addActionRowComponents(
    new ActionRowBuilder().addComponents(select)
  );

  // Sıfırla butonu
  c.addActionRowComponents(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('settings_reset')
        .setLabel('🔄 Tüm Ayarları Sıfırla')
        .setStyle(ButtonStyle.Danger),
    )
  );

  return { components: [c], flags: MessageFlags.IsComponentsV2 };
}

function formatVal(val) {
  if (typeof val === 'boolean') return val ? 'Açık' : 'Kapalı';
  return String(val);
}

// ─── Modal oluştur ────────────────────────────────────────────────

function buildSettingModal(key) {
  const rule = SCHEMA[key];
  return new ModalBuilder()
    .setCustomId(`settings_modal_${key}`)
    .setTitle(`⚙️ ${rule.label}`)
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('settings_modal_value')
          .setLabel(`Yeni değer (${rule.hint})`)
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setPlaceholder(rule.hint)
      )
    );
}

// ─── Komut ───────────────────────────────────────────────────────

module.exports = {
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Sunucu müzik bot ayarlarını yönet')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  buildSettingsPanel,
  buildSettingModal,

  async execute(interaction) {
    return interaction.reply({
      ...buildSettingsPanel(interaction.guildId),
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
  },
};
