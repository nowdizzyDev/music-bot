'use strict';

const { REST, Routes } = require('discord.js');
const path  = require('path');
const fs    = require('fs');

const config   = require('./config.json');
const token    = config.token    || process.env.DISCORD_TOKEN;
const clientId = config.clientId || process.env.CLIENT_ID;
const guildId  = config.guildId  || process.env.GUILD_ID;

if (!token || token === 'YOUR_BOT_TOKEN') {
  console.error('[Deploy] config.json içinde geçerli bir token bulunamadı!');
  process.exit(1);
}
if (!clientId || clientId === 'YOUR_CLIENT_ID') {
  console.error('[Deploy] config.json içinde geçerli bir clientId bulunamadı!');
  process.exit(1);
}

const commands     = [];
const commandsPath = path.join(__dirname, 'commands');

for (const category of fs.readdirSync(commandsPath)) {
  const categoryPath = path.join(commandsPath, category);
  if (!fs.statSync(categoryPath).isDirectory()) continue;

  for (const file of fs.readdirSync(categoryPath).filter((f) => f.endsWith('.js'))) {
    const cmd = require(path.join(categoryPath, file));
    if (cmd?.data?.toJSON) {
      commands.push(cmd.data.toJSON());
      console.log(`  + ${cmd.data.name}`);
    }
  }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`\n[Deploy] ${commands.length} komut deploy ediliyor...`);

    let data;
    if (guildId) {
      data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log(`[Deploy] ${data.length} komut sunucuya deploy edildi (Guild: ${guildId}).`);
    } else {
      data = await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log(`[Deploy] ${data.length} komut globale deploy edildi.`);
    }
  } catch (err) {
    console.error('[Deploy] Hata:', err);
    process.exit(1);
  }
})();
