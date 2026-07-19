# Discord Music Bot

Discord.js v14 ve Components V2 ile yapılmış müzik botu.

## Özellikler

- YouTube, SoundCloud desteği
- Arama sonuçlarını select menüyle listeler
- Canlı güncellenen progress bar
- Duraklat, atla, durdur, karıştır, döngü, ses kontrolü butonları
- Sayfalı kuyruk görünümü
- Tek şarkı / tüm sıra döngüsü
- Önceki şarkıya dön

## Kurulum

**Gereksinimler:** Node.js 22+, FFmpeg

```bash
sudo apt-get install ffmpeg
npm install
```

`config.json` dosyası oluştur:

```json
{
  "token": "BOT_TOKEN",
  "clientId": "CLIENT_ID",
  "guildId": ""
}
```

```bash
node deploy-commands.js
node index.js
```

## Komutlar

| Komut | Açıklama |
|---|---|
| `/play <sorgu>` | Şarkı arar, listeden seç |
| `/pause` | Duraklatır |
| `/resume` | Devam ettirir |
| `/skip` | Atlar |
| `/stop` | Durdurur |
| `/queue` | Sırayı gösterir |
| `/nowplaying` | Şu an çalanı gösterir |
| `/volume <seviye>` | Ses seviyesi (0–150) |
| `/loop <mod>` | Döngü modu |
| `/shuffle` | Sırayı karıştırır |
| `/remove <pozisyon>` | Sıradan şarkı kaldırır |

## Proje Yapısı

```
music-bot/
├── commands/music/
├── events/
├── handlers/
├── emoji.json
├── index.js
└── package.json
```

## Lisans

MIT
