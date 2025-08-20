
<div align="center">

<a href="https://discord.gg/W2GheK3F9m">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:EEFF00,100:a82da8&animation=blink&height=150&reversal=true&width=100&theme=gruvbox&section=header&text=ARINO&fontColor=15f8ef&fontSize=75&fontAlignY=39" />
</a>

# ARINO

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2px; border-radius: 15px; margin: 20px 0;">
  <div style="background: #0d1117; padding: 20px; border-radius: 13px;">
    <img src="https://readme-typing-svg.herokuapp.com?font=Orbitron&weight=700&size=28&duration=2500&pause=800&color=00D9FF&center=true&vCenter=true&width=600&lines=Enterprise+Grade+Music+Bot;Multi-Platform+Streaming;24/7+High+Performance;Advanced+Audio+Processing" alt="Typing Animation" />
  </div>
</div>

[![Version][version-shield]][version-url]
[![Stargazers][stars-shield]][stars-url]
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![License][license-shield]][license-url]

**ARINO** is the most advanced Discord music bot built with **TypeScript**, **Discord.js v14**, **Lavalink**, and enterprise-grade architecture. Featuring multi-platform streaming, advanced audio processing, and unmatched reliability.

</div>

## Key Features

<div style="display: grid; gap: 20px; margin: 30px 0;">

<table style="width: 100%; border-collapse: separate; border-spacing: 10px;">
<tr>
<td align="center" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 20px; border-radius: 15px; border: 2px solid rgba(0,217,255,0.3); box-shadow: 0 8px 16px rgba(0,217,255,0.1);">

**Multi-Platform Streaming**
<div style="margin: 15px 0;">
YouTube • Spotify • Apple Music<br/>
SoundCloud • Deezer • Bandcamp<br/>
JioSaavn • Yandex Music • Twitch
</div>

</td>
<td align="center" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 20px; border-radius: 15px; border: 2px solid rgba(0,217,255,0.3); box-shadow: 0 8px 16px rgba(0,217,255,0.1);">

**Advanced Audio Processing**
<div style="margin: 15px 0;">
Bass Boost • Nightcore • 8D Audio<br/>
Karaoke • Tremolo • Vibrato<br/>
Pitch Control • Speed Control
</div>

</td>
</tr>
<tr>
<td align="center" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 20px; border-radius: 15px; border: 2px solid rgba(0,217,255,0.3); box-shadow: 0 8px 16px rgba(0,217,255,0.1);">

** High Performance**
<div style="margin: 15px 0;">
Discord.js Sharding • Redis Caching<br/>
Lavalink Integration • SQLite/Prisma<br/>
24/7 Mode • Auto-Reconnection
</div>

</td>
<td align="center" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 20px; border-radius: 15px; border: 2px solid rgba(0,217,255,0.3); box-shadow: 0 8px 16px rgba(0,217,255,0.1);">

**Smart Features**
<div style="margin: 15px 0;">
AutoPlay • Live Lyrics<br/>
Queue Management • Fair Play<br/>
Search & History • FavList
</div>

</td>
</tr>
</table>

</div>

## Tech Stack

<div align="center" style="margin: 30px 0;">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![Lavalink](https://img.shields.io/badge/Lavalink-FF6B6B?style=for-the-badge&logo=music&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

</div>

## Commands Overview

<details>
<summary><b> Music Commands (25+)</b></summary>

- **Play Commands**: `play`, `playnext`, `search`, `lyrics`
- **Queue Management**: `queue`, `shuffle`, `clear`, `remove`, `skipto`
- **Playback Control**: `pause`, `resume`, `skip`, `stop`, `seek`, `replay`
- **Audio Control**: `volume`, `loop`, `autoplay`, `fairplay`
- **Utilities**: `nowplaying`, `grab`, `history`, `join`, `leave`

</details>

<details>
<summary><b> Audio Filters (11+)</b></summary>

- **Enhancement**: `bassboost`, `8d`, `nightcore`, `karaoke`
- **Modulation**: `tremolo`, `vibrato`, `rotation`
- **Control**: `pitch`, `speed`, `rate`, `lowpass`, `reset`

</details>

<details>
<summary><b> Settings & Info (10+)</b></summary>

- **Bot Info**: `stats`, `ping`, `help`, `invite`, `support`
- **Settings**: `247`, `prefix`, `lavalink`
- **Sources**: Platform-specific commands for each streaming service

</details>

## Installation & Setup

### Prerequisites

- **Node.js** v18.0.0 or higher
- **Discord Bot Token** & **Application ID**
- **Lavalink Server** (configured and running)
- **Redis** (optional, for caching)

### Quick Start

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ghryanx7/ARINO.git
   cd ARINO
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Settings**
   - Edit `src/config.ts` with your bot credentials
   - Update Lavalink node configuration
   - Set up Redis connection (optional)

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Build & Run**
   ```bash
   npm run build
   npm start
   ```

### Configuration

<details>
<summary><b>📝 src/config.ts Configuration</b></summary>

```typescript
export default {
  TOKEN: "YOUR_BOT_TOKEN",
  CLIENT_ID: "YOUR_CLIENT_ID", 
  PREFIX: "+",
  OWNER_IDS: ["YOUR_USER_ID"],
  
  // Lavalink Configuration
  NODES: [
    {
      id: "Main-Node",
      host: "localhost",
      port: 2333,
      authorization: "youshallnotpass",
      secure: false,
    }
  ],

  // Redis Configuration (Optional)
  REDIS: {
    url: "redis://localhost:6379",
  },

  // Additional settings...
}
```

</details>

## Key Features Explained

### **24/7 Mode**
- Persistent voice channel presence
- Automatic reconnection on disconnects
- Queue restoration after bot restarts

### **AutoPlay System**
- Intelligent track recommendations
- Seamless playback continuation
- Platform-aware suggestions

### **Performance Optimizations**
- Discord.js sharding for scalability
- Redis caching for faster responses
- Advanced error handling & recovery

### **Audio Processing**
- Real-time audio filters
- High-quality audio streaming
- Multiple platform support

## Bot Statistics

<div align="center" style="margin: 30px 0;">

**Live Bot Stats** *(Updated every 5 minutes)*

![Servers](https://img.shields.io/badge/Servers-12+-success?style=for-the-badge)
![Users](https://img.shields.io/badge/Users-500+-blue?style=for-the-badge)
![Uptime](https://img.shields.io/badge/Uptime-99.9%25-brightgreen?style=for-the-badge)
![Commands](https://img.shields.io/badge/Commands-63+-orange?style=for-the-badge)

</div>

## Support & Community

<div style="margin: 30px 0;">

<div align="center">

[![Discord Server](https://img.shields.io/badge/Support_Server-5865F2?style=for-the-badge&logoColor=white&labelColor=1a1a1a)](https://discord.gg/W2GheK3F9m)
[![Invite Bot](https://img.shields.io/badge/Invite_ARINO-00D9FF?style=for-the-badge&logoColor=white&labelColor=1a1a1a)](https://discord.com/oauth2/authorize?client_id=1321595174056362111&permissions=8&scope=bot%20applications.commands&redirect_uri=https%3A%2F%2Fdiscord.com%2Finvite%2FW2GheK3F9m)
[![Website](https://img.shields.io/badge/Website-764ba2?style=for-the-badge&logoColor=white&labelColor=1a1a1a)](https://arino.bot)

</div>

[![Discord Banner](https://cdn.discordapp.com/attachments/1266081851714441267/1336484677199855759/Picsart_25-02-05_05-52-23-511.png)](https://discord.gg/W2GheK3F9m)

</div>

## Roadmap

- [ ] **Web Dashboard** - Full bot management interface
- [ ] **Playlist Sync** - Cross-platform playlist importing
- [ ] **Voice Effects** - Real-time voice modulation
- [ ] **AI Integration** - Smart music recommendations
- [ ] **Custom Plugins** - Extensible plugin system

## License

This project is licensed under the **GPL-3.0 License** - see the [LICENSE](LICENSE) file for details.

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

<div align="center">

## Contributors

<a href="https://github.com/ghryanx7/ARINO/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ghryanx7/ARINO" />
</a>

---

<div style="margin: 25px 0; padding: 15px; background: linear-gradient(135deg, rgba(0,217,255,0.1) 0%, rgba(102,126,234,0.05) 100%); border-radius: 15px; border: 1px solid rgba(0,217,255,0.2);">

**Made with by [RY4N](https://github.com/ryanisnomore)**

*Enterprise-grade Discord music bot for the modern era*

</div>

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer&text=ARINO&fontSize=40&fontColor=FFFFFF&animation=twinkling"/>

</div>

<!-- Shield Links -->
[version-shield]: https://img.shields.io/github/package-json/v/ghryanx7/ARINO?style=for-the-badge&color=00D9FF
[version-url]: https://github.com/ghryanx7/ARINO/releases
[contributors-shield]: https://img.shields.io/github/contributors/ghryanx7/ARINO.svg?style=for-the-badge&color=00D9FF
[contributors-url]: https://github.com/ghryanx7/ARINO/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/ghryanx7/ARINO.svg?style=for-the-badge&color=00D9FF
[forks-url]: https://github.com/ghryanx7/ARINO/network/members
[stars-shield]: https://img.shields.io/github/stars/ghryanx7/ARINO.svg?style=for-the-badge&color=00D9FF
[stars-url]: https://github.com/ghryanx7/ARINO/stargazers
[license-shield]: https://img.shields.io/github/license/ghryanx7/ARINO?style=for-the-badge&color=00D9FF
[license-url]: https://github.com/ghryanx7/ARINO/blob/main/LICENSE
