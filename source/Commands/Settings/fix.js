const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "fix",
  aliases: ["fix"],
  category: "Settings",
  description: "Change the voice channel's region to resolve issues.",
  dev: false,
  options: {
    owner: false,
    inVc: true,
    sameVc: false,
    player: false,
    premium: false,
    vote: false,
  },
  run: async ({ client, message }) => {
    const regions = [
      "us-west",
      "us-east",
      "us-central",
      "us-south",
      "singapore",
      "southafrica",
      "sydney",
      "europe",
      "brazil",
      "hongkong",
      "russia",
      "japan",
      "india",
    ];

    // Check if the user is in a voice channel
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setAuthor({
              name: message.author.username,
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription("You must be in a voice channel to use this command.")
            .setTimestamp(),
        ],
      });
    }

    // Check if the bot has Manage Channels permission
    if (!voiceChannel.permissionsFor(message.guild.members.me).has("ManageChannels")) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setAuthor({
              name: message.author.username,
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription("I need the `Manage Channels` permission to fix the voice region.")
            .setTimestamp(),
        ],
      });
    }

    // Select a random region
    const randomRegion = regions[Math.floor(Math.random() * regions.length)];

    try {
      // Change the region of the voice channel
      await voiceChannel.setRTCRegion(randomRegion);

      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(client.config.color)
            .setAuthor({
              name: message.author.username,
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`Successfully fix in to **${randomRegion}**.`)
            .setTimestamp(),
        ],
      });
    } catch (error) {
      console.error("Error changing voice channel region:", error);

      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setAuthor({
              name: message.author.username,
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription("There was an error while changing the voice channel region.")
            .setTimestamp(),
        ],
      });
    }
  },
};
