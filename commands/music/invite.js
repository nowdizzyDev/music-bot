'use strict';

const { SlashCommandBuilder, ContainerBuilder, SectionBuilder, SeparatorSpacingSize, MessageFlags, OAuth2Scopes, PermissionFlagsBits } = require('discord.js');
const emojis = require('../../emoji.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Botu sunucuna davet etmek için link oluşturur'),

  async execute(interaction, client) {
    const inviteUrl = client.generateInvite({
      scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
      permissions: [
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.Speak,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.UseExternalEmojis,
        PermissionFlagsBits.ViewChannel,
      ],
    });

    const c = new ContainerBuilder();

    const section = new SectionBuilder()
      .addTextDisplayComponents(
        (td) => td.setContent(`## ${emojis.music} Botu Davet Et`),
        (td) => td.setContent('Müzik botunu kendi sunucuna eklemek için aşağıdaki butona tıkla!'),
        (td) => td.setContent(`-# **${client.guilds.cache.size}** sunucuda aktif  •  **${client.user.tag}**`)
      )
      .setButtonAccessory((btn) =>
        btn
          .setLabel('Sunucuna Ekle')
          .setURL(inviteUrl)
          .setStyle(5) // ButtonStyle.Link = 5
          .setEmoji(emojis.heart)
      );

    c.addSectionComponents(section);
    c.addSeparatorComponents((s) => s.setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents((td) =>
      td.setContent(
        `-# Gerekli izinler: Ses kanalına bağlan, Konuş, Mesaj gönder`
      )
    );

    return interaction.reply({
      components: [c],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
  },
};
