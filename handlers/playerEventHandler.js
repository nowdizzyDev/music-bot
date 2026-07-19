'use strict';

const { GuildQueueEvent } = require('discord-player');
const { buildNowPlayingUI, buildInfoUI } = require('./playerUI');

function loadPlayerEvents(client, player) {

  player.events.on(GuildQueueEvent.WillPlayTrack, (queue, track, signal, resolver) => {
    resolver();
  });

  player.events.on(GuildQueueEvent.PlayerStart, async (queue, track) => {
    const channel = queue.metadata?.textChannel;
    if (!channel) return;

    try {
      if (queue.metadata?.nowPlayingMessage) {
        await queue.metadata.nowPlayingMessage.delete().catch(() => null);
      }
      if (queue.metadata?.progressInterval) {
        clearInterval(queue.metadata.progressInterval);
        queue.metadata.progressInterval = null;
      }

      const ui = buildNowPlayingUI(track, queue, {
        isPaused: false,
        loopMode: queue.repeatMode,
        volume:   queue.node.volume,
        position: 0,
      });

      queue.metadata.nowPlayingMessage = await channel.send(ui);

      queue.metadata.progressInterval = setInterval(async () => {
        try {
          const msg = queue.metadata?.nowPlayingMessage;
          if (!msg || !queue.node?.isPlaying()) return;

          const position = queue.node.streamTime;
          const updatedUi = buildNowPlayingUI(track, queue, {
            isPaused: queue.node.isPaused(),
            loopMode: queue.repeatMode,
            volume:   queue.node.volume,
            position,
          });

          await msg.edit(updatedUi).catch(() => null);
        } catch {}
      }, 5_000);

    } catch (err) {
      console.error('[PlayerEvents] PlayerStart hatası:', err.message);
    }
  });

  player.events.on(GuildQueueEvent.Disconnect, async (queue) => {
    const channel = queue.metadata?.textChannel;
    if (queue.metadata?.progressInterval) {
      clearInterval(queue.metadata.progressInterval);
      queue.metadata.progressInterval = null;
    }
    if (queue.metadata?.nowPlayingMessage) {
      await queue.metadata.nowPlayingMessage.delete().catch(() => null);
      queue.metadata.nowPlayingMessage = null;
    }
    if (channel) {
      await channel
        .send(buildInfoUI('info', 'Müzik Bitti', 'Yeni müzik için `/play` kullan!'))
        .catch(() => null);
    }
  });

  player.events.on(GuildQueueEvent.Error, async (queue, error) => {
    console.error(`[Player] Hata (${queue.guild?.name ?? 'bilinmeyen'}):`, error?.message ?? error);
    const channel = queue.metadata?.textChannel;
    if (channel) {
      await channel
        .send(buildInfoUI('error', 'Oynatma Hatası', `\`${error?.message ?? error}\``))
        .catch(() => null);
    }
  });

  player.events.on(GuildQueueEvent.PlayerError, async (queue, error) => {
    console.error(`[Player] PlayerError (${queue.guild?.name ?? 'bilinmeyen'}):`, error?.message ?? error);
    const channel = queue.metadata?.textChannel;
    if (channel) {
      await channel
        .send(buildInfoUI('error', 'Oynatma Hatası', `\`${error?.message ?? error}\``))
        .catch(() => null);
    }
  });

  player.events.on(GuildQueueEvent.PlayerSkip, async (queue, track) => {
    if (queue.metadata?.progressInterval) {
      clearInterval(queue.metadata.progressInterval);
      queue.metadata.progressInterval = null;
    }
    const channel = queue.metadata?.textChannel;
    if (channel) {
      await channel
        .send(buildInfoUI('info', 'Şarkı Atlandı', `**${track.title}** atlandı.`))
        .catch(() => null);
    }
  });

  console.log('[Player] Player event handler yüklendi.');
}

module.exports = loadPlayerEvents;
