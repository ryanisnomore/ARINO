const { EmbedBuilder } = require("discord.js");
const lodash = require("lodash");

module.exports = {
  name: "lavalink",
  aliases: ["node", "shoukaku", "ll"],
  category: "Misc",
  desc: "Displays Lavalink node statistics",
  dev: true,
  options: {
    owner: true,
    inVc: false,
    sameVc: false,
    player: {
      playing: false,
      active: false,
    },
    premium: false,
    vote: false,
  },

  run: async ({ client, message }) => {
    const ms = (await import("pretty-ms")).default;
    const embed = new EmbedBuilder().setColor(client.config.color);

    try {
      const nodes = [...client.kazagumo.shoukaku.nodes.values()];
      if (!nodes.length) {
        embed.setDescription("🚨 No Lavalink nodes found!");
        return message.channel.send({ embeds: [embed] });
      }

      const nodeInfo = nodes.map((node) => {
        const stats = node.stats || {};
        const online = node.state === "CONNECTED";
        const players = stats.players || 0;
        const playing = stats.playingPlayers || 0;
        const uptime = stats.uptime || 0;
        const formattedUptime = ms(uptime, { verbose: true });

        const memory = stats.memory || {};
        const memoryInfo = {
          used: formatMemory(memory.used),
          free: formatMemory(memory.free),
          allocated: formatMemory(memory.allocated),
          reservable: formatMemory(memory.reservable),
        };

        const cpu = stats.cpu || {};
        const cpuInfo = {
          cores: cpu.cores || "N/A",
          systemLoad: formatPercentage(cpu.systemLoad),
          lavalinkLoad: formatPercentage(cpu.lavalinkLoad),
        };

        return formatNodeInfo(node, online, players, playing, formattedUptime, memoryInfo, cpuInfo);
      });

      const pages = lodash.chunk(nodeInfo, 1).map((s) => s.join(""));
      return createPage(client, message, embed, pages);
    } catch (error) {
      console.error("[Lavalink] Error:", error);
      embed.setDescription("❌ An error occurred while fetching Lavalink node information.");
      return message.reply({ embeds: [embed] });
    }
  },
};

// Function to format node information
function formatNodeInfo(node, online, players, playing, uptime, memoryInfo, cpuInfo) {
  return `\`\`\`yaml
- Node Information
  - Name: ${node.name}
  - Status: ${online ? "Disconnected" : "Connected"}
  - Uptime: ${uptime}

- Player Statistics
  - Total Players: ${players}
  - Active Players: ${playing}

- Memory Usage
  - Used: ${memoryInfo.used}
  - Free: ${memoryInfo.free}
  - Allocated: ${memoryInfo.allocated}
  - Reservable: ${memoryInfo.reservable}

- CPU Load
  - Cores: ${cpuInfo.cores}
  - System Load: ${cpuInfo.systemLoad}
  - Lavalink Load: ${cpuInfo.lavalinkLoad}
\`\`\``;
}

// Function to create paginated embed
function createPage(client, message, embed, pages) {
  embed.setDescription(pages[0]);
  return message.channel.send({ embeds: [embed] }).catch(console.error);
}

// Utility functions
function formatMemory(bytes) {
  if (!bytes || isNaN(bytes)) return "N/A";
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatPercentage(value) {
  if (value == null || isNaN(value)) return "N/A";
  return `${(value * 100).toFixed(2)}%`;
}
