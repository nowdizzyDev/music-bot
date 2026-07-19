'use strict';

const {
  ContainerBuilder,
  SectionBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SeparatorSpacingSize,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require('discord.js');

const emojis = require('../emoji.json');

function formatDuration(ms) {
  if (!ms || ms <= 0) return '∞';
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const p = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${p(h)}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
}

function buildProgressBar(current, total, length = 20) {
  if (!total || total <= 0) return '─'.repeat(length);
  const filled = Math.round(Math.min(current / total, 1) * length);
  return '▰'.repeat(filled) + '▱'.repeat(length - filled);
}

function loopInfo(mode) {
  if (mode === 1) return { icon: emojis.loopTrack, label: 'Tek Şarkı' };
  if (mode === 2) return { icon: emojis.loop,      label: 'Sıra'      };
  return                  { icon: emojis.loopOff,  label: 'Kapalı'    };
}

function buildNowPlayingUI(track, queue, options = {}) {
  const { isPaused = false, loopMode = 0, volume = 80, position = 0 } = options;
  const { icon: loopIcon, label: loopLabel } = loopInfo(loopMode);

  const bar     = buildProgressBar(position, track.durationMS);
  const elapsed = formatDuration(position);
  const total   = formatDuration(track.durationMS);
  const upNext  = queue.tracks.size > 0
    ? `Sıradaki: **${queue.tracks.at(0).title}** — ${queue.tracks.size} şarkı daha`
    : 'Sıra boş';

  const c = new ContainerBuilder();

  c.addTextDisplayComponents((td) => td.setContent(`## ${emojis.music} Şu An Çalıyor`));
  c.addSeparatorComponents((s) => s.setDivider(true).setSpacing(SeparatorSpacingSize.Small));

  const section = new SectionBuilder().addTextDisplayComponents(
    (td) => td.setContent(`### [${track.title}](${track.url})`),
    (td) => td.setContent(`**Sanatçı:** ${track.author}`),
    (td) => td.setContent(`**İsteyen:** ${track.requestedBy ?? 'Bilinmiyor'}`)
  );
  if (track.thumbnail) {
    section.setThumbnailAccessory((th) =>
      th.setURL(track.thumbnail).setDescription(`${track.title} kapak görseli`)
    );
  }
  c.addSectionComponents(section);

  c.addSeparatorComponents((s) => s.setDivider(false).setSpacing(SeparatorSpacingSize.Small));
  c.addTextDisplayComponents((td) =>
    td.setContent(
      `\`${bar}\`\n` +
      `${elapsed} / ${total}  •  ${emojis.volumeUp} ${volume}%  •  ${loopIcon} ${loopLabel}`
    )
  );
  c.addSeparatorComponents((s) => s.setDivider(false).setSpacing(SeparatorSpacingSize.Small));
  c.addTextDisplayComponents((td) => td.setContent(`-# ${upNext}`));
  c.addSeparatorComponents((s) => s.setDivider(true).setSpacing(SeparatorSpacingSize.Small));

  c.addActionRowComponents(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('music_previous').setEmoji(emojis.prev).setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(isPaused ? 'music_resume' : 'music_pause')
        .setEmoji(isPaused ? emojis.play : emojis.pause)
        .setLabel(isPaused ? 'Devam Et' : 'Duraklat')
        .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('music_skip').setEmoji(emojis.skip).setLabel('Atla').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('music_stop').setEmoji(emojis.stop).setLabel('Durdur').setStyle(ButtonStyle.Danger),
    )
  );

  c.addActionRowComponents(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('music_shuffle').setEmoji(emojis.shuffle).setLabel('Karıştır').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('music_loop').setEmoji(loopIcon).setLabel('Döngü')
        .setStyle(loopMode > 0 ? ButtonStyle.Success : ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('music_volume_down').setEmoji(emojis.volumeMid).setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('music_volume_up').setEmoji(emojis.volumeUp).setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('music_queue').setEmoji(emojis.queue).setLabel('Sıra').setStyle(ButtonStyle.Secondary),
    )
  );

  return { components: [c], flags: MessageFlags.IsComponentsV2 };
}

function buildQueueUI(queue, page = 1, pageSize = 10) {
  const tracks     = queue.tracks.toArray();
  const totalPages = Math.max(1, Math.ceil(tracks.length / pageSize));
  const safePage   = Math.min(Math.max(page, 1), totalPages);
  const start      = (safePage - 1) * pageSize;
  const items      = tracks.slice(start, start + pageSize);

  const c = new ContainerBuilder();

  c.addTextDisplayComponents((td) =>
    td.setContent(`## ${emojis.queue} Sıra — Sayfa ${safePage}/${totalPages}`)
  );
  c.addSeparatorComponents((s) => s.setDivider(true).setSpacing(SeparatorSpacingSize.Small));

  if (queue.currentTrack) {
    const cur = queue.currentTrack;
    c.addTextDisplayComponents((td) =>
      td.setContent(
        `**${emojis.play} Şu An:** [${cur.title}](${cur.url}) — \`${formatDuration(cur.durationMS)}\`\n` +
        `İsteyen: ${cur.requestedBy ?? 'Bilinmiyor'}`
      )
    );
    c.addSeparatorComponents((s) => s.setDivider(false).setSpacing(SeparatorSpacingSize.Small));
  }

  if (items.length === 0) {
    c.addTextDisplayComponents((td) => td.setContent('*Sıra boş.*'));
  } else {
    c.addTextDisplayComponents((td) =>
      td.setContent(
        items.map((t, i) =>
          `\`${String(start + i + 1).padStart(2, ' ')}.\` [${t.title}](${t.url}) — \`${formatDuration(t.durationMS)}\``
        ).join('\n')
      )
    );
  }

  c.addSeparatorComponents((s) => s.setDivider(true).setSpacing(SeparatorSpacingSize.Small));

  const totalDur = tracks.reduce((a, t) => a + (t.durationMS || 0), 0);
  c.addTextDisplayComponents((td) =>
    td.setContent(`-# Toplam: **${tracks.length}** şarkı  •  Tahmini süre: **${formatDuration(totalDur)}**`)
  );

  c.addActionRowComponents(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`music_queue_page_${safePage - 1}`)
        .setEmoji(emojis.pageBack).setStyle(ButtonStyle.Secondary).setDisabled(safePage <= 1),
      new ButtonBuilder()
        .setCustomId('music_queue_refresh')
        .setEmoji(emojis.refresh).setLabel('Yenile').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`music_queue_page_${safePage + 1}`)
        .setEmoji(emojis.pageNext).setStyle(ButtonStyle.Secondary).setDisabled(safePage >= totalPages),
    )
  );

  return { components: [c], flags: MessageFlags.IsComponentsV2 };
}

function buildInfoUI(type, title, description) {
  const emojiMap = {
    success: emojis.success,
    error:   emojis.error,
    warning: emojis.warning,
    info:    emojis.info,
  };

  const c = new ContainerBuilder();
  c.addTextDisplayComponents((td) => td.setContent(`${emojiMap[type] ?? ''} **${title}**`));

  if (description) {
    c.addSeparatorComponents((s) => s.setDivider(false).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents((td) => td.setContent(description));
  }

  return { components: [c], flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral };
}

function buildAddedToQueueUI(track, position) {
  const c = new ContainerBuilder();

  const section = new SectionBuilder().addTextDisplayComponents(
    (td) => td.setContent(`${emojis.success} **Sıraya Eklendi**`),
    (td) => td.setContent(`[${track.title}](${track.url})`),
    (td) => td.setContent(
      `**Sanatçı:** ${track.author}  •  **Süre:** ${formatDuration(track.durationMS)}\n` +
      `**Sıra pozisyonu:** ${position}`
    )
  );

  if (track.thumbnail) {
    section.setThumbnailAccessory((th) =>
      th.setURL(track.thumbnail).setDescription(track.title)
    );
  }

  c.addSectionComponents(section);
  return { components: [c], flags: MessageFlags.IsComponentsV2 };
}

function buildSearchResultsUI(query, tracks) {
  const c = new ContainerBuilder();

  c.addTextDisplayComponents((td) => td.setContent(`## ${emojis.music} Arama Sonuçları`));
  c.addSeparatorComponents((s) => s.setDivider(true).setSpacing(SeparatorSpacingSize.Small));
  c.addTextDisplayComponents((td) =>
    td.setContent(`🔍 **"${query}"** için ${tracks.length} sonuç bulundu.\nAşağıdan bir şarkı seç:`)
  );
  c.addSeparatorComponents((s) => s.setDivider(false).setSpacing(SeparatorSpacingSize.Small));

  const options = tracks.slice(0, 10).map((track, i) =>
    new StringSelectMenuOptionBuilder()
      .setLabel(track.title.slice(0, 100))
      .setDescription(`${track.author} — ${formatDuration(track.durationMS)}`.slice(0, 100))
      .setValue(`${i}`)
      .setEmoji(emojis.play)
  );

  c.addActionRowComponents(
    new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('music_search_select')
        .setPlaceholder(`${emojis.music} Bir şarkı seç...`)
        .addOptions(options)
    )
  );

  c.addSeparatorComponents((s) => s.setDivider(false).setSpacing(SeparatorSpacingSize.Small));
  c.addTextDisplayComponents((td) => td.setContent(`-# Seçim yapmazsan 60 saniye sonra bu menü kapanır.`));

  return { components: [c], flags: MessageFlags.IsComponentsV2 };
}

module.exports = {
  buildNowPlayingUI,
  buildQueueUI,
  buildInfoUI,
  buildAddedToQueueUI,
  buildSearchResultsUI,
  formatDuration,
  buildProgressBar,
};
