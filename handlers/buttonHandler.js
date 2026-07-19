'use strict';

const { useQueue, useTimeline, QueueRepeatMode } = require('discord-player');
const { buildNowPlayingUI, buildQueueUI, buildInfoUI } = require('./playerUI');

async function handleButtons(interaction) {
  const id = interaction.customId;

  if (id.startsWith('music_queue_page_')) {
    return handleQueuePage(interaction, parseInt(id.replace('music_queue_page_', ''), 10));
  }
  if (id === 'music_queue_refresh') return handleQueuePage(interaction, 1);

  switch (id) {
    case 'music_pause':       return handlePause(interaction);
    case 'music_resume':      return handleResume(interaction);
    case 'music_skip':        return handleSkip(interaction);
    case 'music_stop':        return handleStop(interaction);
    case 'music_previous':    return handlePrevious(interaction);
    case 'music_shuffle':     return handleShuffle(interaction);
    case 'music_loop':        return handleLoop(interaction);
    case 'music_volume_up':   return handleVolume(interaction, +10);
    case 'music_volume_down': return handleVolume(interaction, -10);
    case 'music_queue':       return handleQueuePage(interaction, 1);
    default:
      return interaction.reply(buildInfoUI('error', 'Bilinmeyen Buton', `\`${id}\``));
  }
}

function inSameVoice(interaction) {
  const bot  = interaction.guild.members.me?.voice?.channel;
  const user = interaction.member?.voice?.channel;
  return bot && user && bot.id === user.id;
}

function voiceErr(interaction) {
  return interaction.reply(buildInfoUI('error', 'Kanal Hatası', 'Botla aynı ses kanalında değilsin!'));
}

async function refreshNowPlaying(queue) {
  if (!queue?.currentTrack) return;
  const timeline = useTimeline(queue.guild);
  const position = timeline?.timestamp?.current?.value ?? 0;
  const ui = buildNowPlayingUI(queue.currentTrack, queue, {
    isPaused: queue.node.isPaused(),
    loopMode: queue.repeatMode,
    volume:   queue.node.volume,
    position,
  });
  const msg = queue.metadata?.nowPlayingMessage;
  if (msg?.editable) await msg.edit(ui).catch(() => null);
}

async function handlePause(interaction) {
  if (!inSameVoice(interaction)) return voiceErr(interaction);
  const queue = useQueue(interaction.guild);
  if (!queue?.currentTrack) return interaction.reply(buildInfoUI('warning', 'Çalmıyor', ''));
  queue.node.pause();
  await refreshNowPlaying(queue);
  return interaction.deferUpdate();
}

async function handleResume(interaction) {
  if (!inSameVoice(interaction)) return voiceErr(interaction);
  const queue = useQueue(interaction.guild);
  if (!queue) return interaction.reply(buildInfoUI('warning', 'Kuyruk Yok', ''));
  queue.node.resume();
  await refreshNowPlaying(queue);
  return interaction.deferUpdate();
}

async function handleSkip(interaction) {
  if (!inSameVoice(interaction)) return voiceErr(interaction);
  const queue = useQueue(interaction.guild);
  if (!queue?.currentTrack) return interaction.reply(buildInfoUI('warning', 'Çalmıyor', ''));
  queue.node.skip();
  return interaction.deferUpdate();
}

async function handleStop(interaction) {
  if (!inSameVoice(interaction)) return voiceErr(interaction);
  const queue = useQueue(interaction.guild);
  if (!queue) return interaction.reply(buildInfoUI('warning', 'Kuyruk Yok', ''));
  queue.delete();
  return interaction.update(buildInfoUI('info', 'Durduruldu', 'Müzik durduruldu.')).catch(() => interaction.deferUpdate());
}

async function handlePrevious(interaction) {
  if (!inSameVoice(interaction)) return voiceErr(interaction);
  const queue = useQueue(interaction.guild);
  if (!queue?.history?.previousTrack) {
    return interaction.reply(buildInfoUI('warning', 'Önceki Şarkı Yok', 'Geçmişte şarkı bulunamadı.'));
  }
  await queue.history.back();
  return interaction.deferUpdate();
}

async function handleShuffle(interaction) {
  if (!inSameVoice(interaction)) return voiceErr(interaction);
  const queue = useQueue(interaction.guild);
  if (!queue?.tracks.size) return interaction.reply(buildInfoUI('warning', 'Boş Sıra', ''));
  queue.tracks.shuffle();
  await refreshNowPlaying(queue);
  return interaction.deferUpdate();
}

async function handleLoop(interaction) {
  if (!inSameVoice(interaction)) return voiceErr(interaction);
  const queue = useQueue(interaction.guild);
  if (!queue) return interaction.reply(buildInfoUI('warning', 'Kuyruk Yok', ''));

  const next =
    queue.repeatMode === QueueRepeatMode.OFF   ? QueueRepeatMode.TRACK :
    queue.repeatMode === QueueRepeatMode.TRACK ? QueueRepeatMode.QUEUE :
    QueueRepeatMode.OFF;

  queue.setRepeatMode(next);
  await refreshNowPlaying(queue);
  return interaction.deferUpdate();
}

async function handleVolume(interaction, delta) {
  if (!inSameVoice(interaction)) return voiceErr(interaction);
  const queue = useQueue(interaction.guild);
  if (!queue?.currentTrack) return interaction.reply(buildInfoUI('warning', 'Çalmıyor', ''));
  queue.node.setVolume(Math.min(150, Math.max(0, queue.node.volume + delta)));
  await refreshNowPlaying(queue);
  return interaction.deferUpdate();
}

async function handleQueuePage(interaction, page) {
  const queue = useQueue(interaction.guild);
  if (!queue?.currentTrack) {
    return interaction.reply(buildInfoUI('warning', 'Çalmıyor', 'Aktif kuyruk yok.'));
  }
  return interaction.reply(buildQueueUI(queue, page));
}

module.exports = handleButtons;
