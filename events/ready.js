'use strict';

const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`[Bot] ${client.user.tag} olarak giriş yapıldı!`);
    console.log(`[Bot] ${client.guilds.cache.size} sunucuda aktif.`);
    client.user.setActivity('🎵 /play ile müzik çal', { type: ActivityType.Listening });
  },
};
