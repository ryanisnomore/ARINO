const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const cooldowns = new Map();

function handleCooldown(userId) {
  const now = Date.now();
  const cooldownTime = 5000; // 5 seconds cooldown
  for (const [id, timestamp] of cooldowns) {
    if (now - timestamp > cooldownTime) {
      cooldowns.delete(id);
    }
  }
  if (cooldowns.has(userId)) {
    const expirationTime = cooldowns.get(userId) + cooldownTime;
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return Math.round(timeLeft);
    }
  }
  cooldowns.set(userId, now);
  return 0;
}

module.exports = {
  name: "ping",
  aliases: ["latency"],
  category: 'Misc',
  permission: "",
  desc: "Gets the latency of the Discord API and client!",
  options: {
    owner: false,
    inVc: false,
    sameVc: false,
    player: {
      playing: false,
      active: false,
    },
    premium: false,
    vote: false,
  },
  run: async ({ client, message, args }) => {
    try {
      let ping = message.guild.shard.ping;
      let pingS = (ping / 1000).toFixed(3);  // Convert to seconds

      const embed = new EmbedBuilder()
        .setColor(client.config.color)
        .setAuthor({
          name: `${client.user.username}'s Ping`,
          iconURL: client.user.displayAvatarURL(),
        })
        .setDescription(`Shard [${message.guild.shardId}]: **${pingS}**s!`)
        .setFooter({
          text: `Requested by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Shard Ping")
          .setStyle(ButtonStyle.Primary)  // Default blue button
          .setCustomId("shard_ping")
          .setDisabled(false),
        new ButtonBuilder()
          .setLabel("Message Latency")
          .setStyle(ButtonStyle.Primary)  // Default blue button
          .setCustomId("msg_latency")
          .setDisabled(false)
      );

      const response = await message.reply({
        embeds: [embed],
        components: [row],
      });

      const collector = response.createMessageComponentCollector({
        time: 60000, // Collector time is 1 minute
      });

      collector.on("collect", async (interaction) => {
        if (interaction.user.id !== message.author.id) {
          await interaction.reply({
            content: "You are not allowed to interact with this button.",
            ephemeral: true,
          });
          return;
        }

        let newRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("Shard Ping")
            .setStyle(ButtonStyle.Danger) // Set to red for the clicked button
            .setCustomId("shard_ping")
            .setDisabled(true), // Disable the clicked button
          new ButtonBuilder()
            .setLabel("Message Latency")
            .setStyle(ButtonStyle.Success) // Set to green for the other button
            .setCustomId("msg_latency")
            .setDisabled(false) // Keep the other button enabled
        );

        if (interaction.customId === "shard_ping") {
          const shardPingEmbed = new EmbedBuilder()
            .setColor(client.config.color)
            .setAuthor({
              name: `${client.user.username}'s Shard Ping`,
              iconURL: client.user.displayAvatarURL(),
            })
            .setDescription(`Shard [${message.guild.shardId}]: **${pingS}**s!`)
            .setFooter({
              text: `Requested by ${message.author.tag}`,
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp();

          await interaction.update({
            embeds: [shardPingEmbed],
            components: [newRow],
          });
        } else if (interaction.customId === "msg_latency") {
          const latencyMs = (response.createdTimestamp - message.createdTimestamp) / 1000;

          const latencyEmbed = new EmbedBuilder()
            .setColor(client.config.color)
            .setAuthor({
              name: `${client.user.username}'s Message Latency`,
              iconURL: client.user.displayAvatarURL(),
            })
            .setDescription(`Message Latency: **${latencyMs.toFixed(3)}**s!`)
            .setFooter({
              text: `Requested by ${message.author.tag}`,
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp();

          newRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel("Shard Ping")
              .setStyle(ButtonStyle.Success) // Set to green for the other button
              .setCustomId("shard_ping")
              .setDisabled(false), // Enable the other button
            new ButtonBuilder()
              .setLabel("Message Latency")
              .setStyle(ButtonStyle.Danger) // Set to red for the clicked button
              .setCustomId("msg_latency")
              .setDisabled(true) // Disable the clicked button
          );

          await interaction.update({
            embeds: [latencyEmbed],
            components: [newRow],
          });
        }
      });

      collector.on("end", () => {
        response.edit({ components: [] });
      });
    } catch (error) {
      console.error("Error in ping command:", error);
      await message.reply(
        "An error occurred while processing your request. Please try again later."
      );
    }
  },
};
