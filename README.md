# 🎵 Discord Music Bot

**Discord.js v14** + **Components V2** ile yapılmış, Jockie Music benzeri zengin arayüzlü müzik botu.

## ✨ Özellikler

- 🎵 **Multi-kaynak destek** — Spotify, SoundCloud, Deezer, Apple Music, YouTube Music
- 🖥️ **Components V2 UI** — Embed yerine yeni nesil bileşen tabanlı arayüz
- ⏯️ **İnteraktif butonlar** — Duraklat, atla, durdur, karıştır, döngü, ses kontrolü
- 📋 **Sayfalı kuyruk görünümü** — Butonlarla gezinebilir sıra listesi
- 🔂 **Döngü modları** — Tek şarkı / sıranın tamamı / kapalı
- 🔊 **Ses kontrolü** — 0–150% arası ses seviyesi
- ⏮️ **Önceki şarkı** — Çalınmış şarkılara geri dön

## 📦 Kurulum

### 1. Gereksinimler

- Node.js 22.12.0+
- npm veya yarn
- FFmpeg sisteminizde kurulu olmalı

```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# Windows (Chocolatey)
choco install ffmpeg
```

### 2. Bağımlılıkları Kur

```bash
cd music-bot
npm install
```

### 3. `.env` Dosyasını Ayarla

`.env` dosyasını aç ve değerleri doldur:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here   # Boş bırakırsan global deploy yapılır
```

**Token ve Client ID nereden alınır?**
1. [Discord Developer Portal](https://discord.com/developers/applications) → Yeni uygulama oluştur
2. **Bot** sekmesi → Token kopyala → `DISCORD_TOKEN`
3. **OAuth2** sekmesi → Client ID kopyala → `CLIENT_ID`
4. Bot'u sunucuna davet et (gerekli izinler: `bot`, `applications.commands`, Voice + Send Messages)

### 4. Komutları Deploy Et

```bash
npm run deploy
```

### 5. Botu Başlat

```bash
# Normal başlatma
npm start

# Geliştirme (otomatik yeniden başlatma)
npm run dev
```

## 🎮 Komutlar

| Komut | Açıklama |
|---|---|
| `/play <sorgu>` | Şarkı çalar veya sıraya ekler |
| `/pause` | Çalmayı duraklatır |
| `/resume` | Devam ettirir |
| `/skip [adet]` | Şarkı atlar |
| `/stop` | Durdurur ve kanaldan ayrılır |
| `/queue [sayfa]` | Sırayı gösterir |
| `/nowplaying` | Şu an çalan şarkıyı gösterir |
| `/volume [seviye]` | Ses seviyesini ayarlar |
| `/loop <mod>` | Döngü modunu ayarlar |
| `/shuffle` | Sırayı karıştırır |
| `/remove <pozisyon>` | Sıradan şarkı kaldırır |

## 🏗️ Proje Yapısı

```
music-bot/
├── src/
│   ├── commands/
│   │   └── music/          # Müzik komutları
│   ├── components/
│   │   └── playerUI.js     # Components V2 UI builder
│   ├── events/
│   │   ├── ready.js
│   │   └── interactionCreate.js
│   ├── handlers/
│   │   ├── commandHandler.js
│   │   ├── eventHandler.js
│   │   ├── playerEventHandler.js
│   │   └── buttonHandler.js
│   ├── config.js
│   ├── deploy-commands.js
│   └── index.js
├── .env
├── .gitignore
└── package.json
```

## 🔧 Components V2 Hakkında

Bu bot, Discord'un yeni **Components V2** sistemini kullanır:

- **Container** — Renkli çerçeve içinde gruplu bileşenler
- **Section + Thumbnail** — Şarkı kapağı ile yan yana bilgi
- **TextDisplay** — Markdown destekli zengin metin
- **Separator** — Görsel ayırıcılar
- **ActionRow + Button** — İnteraktif kontrol butonları

> ⚠️ Components V2 kullanımında mesajlara `content`, `embeds` veya `poll` eklenemez.

## 📝 Notlar

- **YouTube** desteği discord-player v7'de kaldırılmıştır. Spotify/SoundCloud/Deezer çalışmaktadır.
- Spotify için `SPOTIFY_CLIENT_ID` ve `SPOTIFY_CLIENT_SECRET` gerekebilir (extractor ayarlarına bak).
- Bot ses kanalınızda değilse komutlar çalışmaz.

## 📄 Lisans

MIT
