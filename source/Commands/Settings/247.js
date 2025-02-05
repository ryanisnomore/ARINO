const guildSchema = require("../../Models/Guild");

module.exports = {
  name: "247",
  aliases: ["always-on", "24/7", "alwayson"],
  category: "Settings",
  permission: "ManageGuild",
  desc: "Toggle the 24/7 Mode",
  dev: false,
  options: {
    owner: false,
    inVc: true,
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
      const guildId = message.guild.id;
      const textChannelId = message.channel.id;
      const voiceChannelId = message.member.voice.channel?.id;
      
      if (!voiceChannelId) {
        return message.reply(
          "You need to be in a Voice Channel to enable 24/7 mode."
        );
      }

      let player = await client.kazagumo.players.get(guildId);
      if (!player) {
        await client.music.CreateAvonPlayer(message);
        player = await client.kazagumo.players.get(guildId);
      }

      let guildData = await guildSchema.findOne({ id: guildId });
      if (!guildData) {
        guildData = new guildSchema({ id: guildId });
      }

      const newStatus = !guildData.twentyFourSeven?.enabled;
      guildData.twentyFourSeven = {
        enabled: newStatus,
        textChannel: textChannelId,
        voiceChannel: voiceChannelId,
      };

      await guildData.save();

      const statusMessage = `- 24/7 has been **${newStatus ? "Enabled" : "Disabled"}** for **${message.guild.name}** `;
      
      if (!newStatus && player) {
        player.destroy();
      }

      return message.reply(statusMessage);

    } catch (error) {
      console.error("Error in 247 command:", error);
      return message.reply(
        "An error occurred while toggling 24/7 mode. Please try again later."
      );
    }
  },
};
