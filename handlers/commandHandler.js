'use strict';

const path = require('path');
const fs   = require('fs');

function loadCommands(client) {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const categories   = fs.readdirSync(commandsPath);
  let count = 0;

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith('.js'));

    for (const file of files) {
      const command = require(path.join(categoryPath, file));
      if (!command?.data?.name || typeof command.execute !== 'function') {
        console.warn(`[Commands] Geçersiz komut atlandı: ${file}`);
        continue;
      }
      client.commands.set(command.data.name, command);
      count++;
    }
  }

  console.log(`[Commands] ${count} komut yüklendi.`);
}

module.exports = loadCommands;
