'use strict';

const db = require('croxydb');

// ─── Varsayılan guild ayarları (renkler yok, Component V2 kullanılıyor) ───
const DEFAULTS = {
  volume:               80,
  queuePageSize:        10,
  leaveOnEmpty:         true,
  leaveOnEmptyCooldown: 30000,
  leaveOnEnd:           true,
  leaveOnEndCooldown:   30000,
  selfDeaf:             true,
};

// Ayar şeması — doğrulama için
const SCHEMA = {
  volume:               { type: 'integer', min: 0,     max: 150,    label: 'Varsayılan Ses',         hint: '0–150' },
  queuePageSize:        { type: 'integer', min: 5,     max: 25,     label: 'Sıra Sayfa Boyutu',      hint: '5–25' },
  leaveOnEmpty:         { type: 'boolean',                           label: 'Boş Kanalda Ayrıl',      hint: 'true / false' },
  leaveOnEmptyCooldown: { type: 'integer', min: 5000,  max: 300000, label: 'Boş Kanal Bekleme (ms)', hint: '5000–300000' },
  leaveOnEnd:           { type: 'boolean',                           label: 'Sıra Bitince Ayrıl',     hint: 'true / false' },
  leaveOnEndCooldown:   { type: 'integer', min: 5000,  max: 300000, label: 'Sıra Bitti Bekleme (ms)',hint: '5000–300000' },
  selfDeaf:             { type: 'boolean',                           label: 'Kendini Sağırlaştır',    hint: 'true / false' },
};

// ─── Yardımcı: sığ birleştirme ───────────────────────────────────
function merge(defaults, saved) {
  return { ...defaults, ...saved };
}

/**
 * Bir guild'in tüm ayarlarını döndürür.
 */
function getSettings(guildId) {
  const saved = db.get(`guild_${guildId}`) ?? {};
  return merge(DEFAULTS, saved);
}

/**
 * Tek bir ayarı günceller.
 */
function setSetting(guildId, key, value) {
  db.set(`guild_${guildId}.${key}`, value);
}

/**
 * Tüm ayarları sıfırlar.
 */
function resetSettings(guildId) {
  db.delete(`guild_${guildId}`);
}

/**
 * Değer doğrulaması.
 * @returns {{ valid: boolean, parsed?: any, error?: string }}
 */
function validateSetting(key, rawValue) {
  const rule = SCHEMA[key];
  if (!rule) return { valid: false, error: 'Bilinmeyen ayar.' };

  if (rule.type === 'integer') {
    const n = parseInt(rawValue, 10);
    if (isNaN(n))                      return { valid: false, error: `Sayı girilmeli. (${rule.hint})` };
    if (n < rule.min || n > rule.max)  return { valid: false, error: `${rule.hint} aralığında olmalı.` };
    return { valid: true, parsed: n };
  }

  if (rule.type === 'boolean') {
    const v = rawValue.toLowerCase().trim();
    const isTrue  = ['true', 'evet', 'yes', '1', 'açık', 'on'].includes(v);
    const isFalse = ['false', 'hayır', 'no', '0', 'kapalı', 'off'].includes(v);
    if (!isTrue && !isFalse) return { valid: false, error: '`true` veya `false` girilmeli.' };
    return { valid: true, parsed: isTrue };
  }

  return { valid: false, error: 'Bilinmeyen tür.' };
}

module.exports = { getSettings, setSetting, resetSettings, validateSetting, DEFAULTS, SCHEMA };
