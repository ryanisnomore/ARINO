const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { cpus, totalmem } = require("node:os");
const { cpu } = require("systeminformation");

module.exports = {
  name: "stats",
  aliases: ["statistics", "st"],
  category: "Misc",
  permission: "",
  desc: "Get detailed bot statistics and system information",
  options: {
    owner: false,
    inVc: false,
    sameVc: false,
    player: { playing: false, active: false },
    premium: false,
    vote: false,
  },

  run: async ({ client, message }) => {
    try {
      const ping = message.guild.shard.ping;

      // Temporary loading embed
      const loadingEmbed = new EmbedBuilder()
        .setDescription("<a:DaisyLoading:1271046875541278791> Loading...")
        .setColor("#2f3136");

      const msg = await message.reply({ embeds: [loadingEmbed] });

      // Fetch the bot statistics
      const [guildCount, userCount, channelCount, developerPresence] = await Promise.all([
        client.guilds.cache.size,
        client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
        client.channels.cache.size,
        getDeveloperPresence(client),
      ]);

      // General Info Embed
      const generalEmbed = new EmbedBuilder()
        .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL() })
        .addFields([
          {
            name: `__${client.user.username}'s Info__`,
            value: `Servers: ${guildCount}\nUsers: ${userCount}\nChannels: ${channelCount}\nShards: 1\nClusters: 1\nAPI Latency: ${ping.toFixed(2)}ms\nRestarted: <t:${Math.round(client.readyTimestamp / 1000)}:R>`,
          },
        ])
        .setThumbnail(client.user.displayAvatarURL())
        .setColor("#2f3136");

      // CPU and Memory Info Embed
      const cpuInfo = await cpu();
      const cpuUsage = ((process.cpuUsage().user + process.cpuUsage().system) / 1e6).toFixed(2);
      const sysEmbed = new EmbedBuilder()
        .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL() })
        .addFields([
          {
            name: "CPU Info",
            value: `Cores: ${cpus().length}\nModel: ${cpus()[0].model}\nSpeed: ${cpus()[0].speed} MHz\nUsage: ${cpuUsage}%`,
          },
          {
            name: "Memory Info",
            value: `Total: ${(totalmem() / 1024 / 1024).toFixed(2)} MB\nUsed: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
          },
        ])
        .setColor("#2f3136");

      // Developer Info Embed
      const aboutEmbed = new EmbedBuilder()
        .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL() })
        .setDescription(`**Developer:** [RY4N](https://discord.com/users/1085376019445321829)\n**Status:** ${developerPresence}`)
        .setColor("#2f3136");

      // Links Embed
      const linksEmbed = new EmbedBuilder()
        .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL() })
        .setDescription(`
__Links__  
**[Support Server](https://discord.gg/W2GheK3F9m)**  
Feel free to join our community for any assistance.

**[Bot Invite](https://discord.com/oauth2/authorize?client_id=1265381470810411159&permissions=1321595174056362111&response_type=code&redirect_uri=https%3A%2F%2Fdiscord.com%2Finvite%2FXtzvJVmBa2&integration_type=0&scope=bot+guilds)**  
Invite **AIRINO** to your servers.

**[Vote On Top.gg](https://top.gg/bot/1321595174056362111/vote)**  
Support **AIRINO** with your valuable vote.

**[Privacy Policy](https://github.com/imLovejot/Silvy/blob/main/Privacy.md)**  
Click on the \`Privacy Policy\` option to check **AIRINO** bot privacy policy.

**[Terms Of Service](https://github.com/imLovejot/Silvy/blob/main/Terms.md)**  
Click on the \`Terms Of Service\` option to re-direct to **AIRINO** bot terms of service page.
        `)
        .setColor("#2f3136");

      // Buttons
      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("gen").setLabel("General").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("sys").setLabel("System").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("ptnr").setLabel("About Team").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("team").setLabel("Links").setStyle(ButtonStyle.Secondary)
      );

      await msg.edit({ embeds: [generalEmbed], components: [buttons] });

      // Button Interaction Collector
      const collector = msg.createMessageComponentCollector({ time: 60000 });

      collector.on("collect", async (interaction) => {
        if (!interaction.isButton()) return;
        await interaction.deferUpdate();

        switch (interaction.customId) {
          case "gen":
            await msg.edit({ embeds: [generalEmbed] });
            break;
          case "sys":
            await msg.edit({ embeds: [sysEmbed] });
            break;
          case "ptnr":
            await msg.edit({ embeds: [aboutEmbed] });
            break;
          case "team":
            await msg.edit({ embeds: [linksEmbed] });
            break;
        }
      });

      collector.on("end", () => {
        // Disable buttons after 60 seconds, but keep them visible
        msg.edit({
          components: [
            new ActionRowBuilder().addComponents(
              buttons.components.map((button) => button.setDisabled(true))
            ),
          ],
        });
      });
    } catch (e) {
      console.error(e);
      message.reply("There was an error fetching the statistics. Please try again later.");
    }
  },
};

// Presence Checker (optimized)
async function getDeveloperPresence(client) {
  try {
    const guild = await client.guilds.fetch("1092123729401745510");
    const dev = await guild.members.fetch("1085376019445321829");
    return checkMemPresence(dev);
  } catch (e) {
    console.log("Error fetching developer presence:", e);
    return "<:dnd:1285313837628657726>";
  }
}

function checkMemPresence(member) {
  if (!member?.presence?.status) return "<:dnd:1285313837628657726>";
  return {
    online: "<:IconStatusOnlin:1285314130550587436>",
    idle: "<:Idle:1285313953597100104>",
    dnd: "<:dnd:1285313837628657726>",
  }[member.presence.status] || "<:dnd:1285313837628657726>";
}
