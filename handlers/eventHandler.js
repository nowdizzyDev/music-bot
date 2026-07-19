'use strict';

const path = require('path');
const fs   = require('fs');

function loadEvents(client) {
  const eventsPath = path.join(__dirname, '..', 'events');
  const files      = fs.readdirSync(eventsPath).filter((f) => f.endsWith('.js'));
  let count = 0;

  for (const file of files) {
    const event = require(path.join(eventsPath, file));
    if (!event?.name || typeof event.execute !== 'function') {
      console.warn(`[Events] Geçersiz event atlandı: ${file}`);
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
    count++;
  }

  console.log(`[Events] ${count} event yüklendi.`);
}

module.exports = loadEvents;
