const guildSchema = require("../../Models/Guild");

module.exports = {
  name: "autoplay",
  aliases: ["auto-play", "ap"],
  category: "Settings",
  permission: "ManageGuild",
  desc: "Toggle the Autoplay Feature",
  dev: false,
  options: {
    owner: false,
    inVc: true,
    sameVc: true,
    player: {
      playing: false,
      active: false,
    },
    premium: false,
    vote: false,
  },

  run: async ({ client, message }) => {
    try {
      let guildData = await guildSchema.findOne({ id: message.guild.id });
      
      if (!guildData) {
        guildData = await guildSchema.findOneAndUpdate(
          { id: message.guild.id },
          { $setOnInsert: { id: message.guild.id, prefix: "+" } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }

      const oldStatus = guildData.settings?.autoplay || false;
      const newStatus = !oldStatus;

      await guildSchema.findOneAndUpdate(
        { id: message.guild.id },
        { $set: { "settings.autoplay": newStatus } }
      );

      return message.reply(
        `- Autoplay has been **${newStatus ? "Enabled" : "Disabled"}**  for **${message.guild.name}** `
      );

    } catch (error) {
      console.error("Autoplay command error:", error);
      return message.reply(
        "An error occurred while updating autoplay settings. Please try again later."
      );
    }
  },
};