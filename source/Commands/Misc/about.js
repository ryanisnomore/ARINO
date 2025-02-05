const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "about",
  aliases: ["info", "botinfo", "bi"],
  category: "Misc",
  permission: "",
  desc: "Displays information about the bot",
  dev: false,
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
  run: async ({ client, message }) => {
    try {
      const embed = new EmbedBuilder()
        .setColor(client.config.color) // Replace with your desired color
        .setAuthor({
          name: `${client.user.username}`,
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
        })
        .setTitle("About Me")
        .setDescription(
          `Hello! I am **${client.user.username}**, a Discord Bot developed by **RY4N**.\n\n` +
            `- I am a best-in-class Music Bot with **Simplicity**!\n` +
            `- I am developed using **Shoukaku** and **Discord.js**.\n` +
            `- I am currently serving **${client.guilds.cache.size} servers**.\n` +
            `- First Launch **Thu Dec 26 2024** at 09:35:33 GMT+0000 (Greenwich Mean Time).`
        )
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }));

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error in about command:", error);
      message.channel.send("An error occurred while displaying the about information.");
    }
  },
};
