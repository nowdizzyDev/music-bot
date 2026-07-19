'use strict';

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Player } = require('discord-player');
const { SoundCloudExtractor, AttachmentExtractor } = require('@discord-player/extractor');
const { YoutubeiExtractor } = require('discord-player-youtubei');

for (const method of ['log', 'warn', 'info', 'debug']) {
  const orig = console[method].bind(console);
  console[method] = (...args) => {
    if (typeof args[0] === 'string' && args[0].startsWith('[YOUTUBEJS]')) return;
    orig(...args);
  };
}

const loadCommands    = require('./handlers/commandHandler');
const loadEvents      = require('./handlers/eventHandler');
const loadPlayerEvents = require('./handlers/playerEventHandler');

const config = require('./config.json');
const TOKEN  = config.token || process.env.DISCORD_TOKEN;

if (!TOKEN || TOKEN === 'YOUR_BOT_TOKEN') {
  console.error('[Bot] config.json içinde geçerli bir token bulunamadı!');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

const player = new Player(client);

(async () => {
  await player.extractors.register(YoutubeiExtractor, { useYoutubeDL: true });
  await player.extractors.loadMulti([SoundCloudExtractor, AttachmentExtractor]);
  console.log('[Player] Extractors yüklendi.');
  console.log('[Player] Kayıtlı extractors:', player.extractors.store.map(e => e.identifier));
})();

client.player = player;

loadCommands(client);
loadEvents(client);
loadPlayerEvents(client, player);

client.login(TOKEN).catch((err) => {
  console.error('[Bot] Giriş başarısız:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => console.error('[UNHANDLED REJECTION]', reason));
process.on('uncaughtException',  (err)    => console.error('[UNCAUGHT EXCEPTION]', err));
