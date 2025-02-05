const guildSchema = require("../../Models/Guild");

module.exports = {
  name: "prefix",
  aliases: ["setprefix", "pfx"],
  category: "Settings",
  permission: "ManageGuild",
  dev: false,
  desc: "Change the Prefix of the Bot in the Server",
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
      let guildData = await guildSchema.findOne({ id: message.guild.id });
      
      if (!guildData) {
        guildData = await guildSchema.findOneAndUpdate(
          { id: message.guild.id },
          { $setOnInsert: { id: message.guild.id, prefix: "+" } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }

      if (!args[0]) {
        return message.reply(
          `- Current Prefix: \`${guildData.prefix}\``
        );
      }

      const oldPrefix = guildData.prefix;
      await guildSchema.findOneAndUpdate(
        { id: message.guild.id },
        { $set: { prefix: args[0] } }
      );

      return message.reply(
        `- Prefix Changed \`${oldPrefix}\` to \`${args[0]}\`\n` +
        `- Updated by: ${message.author.username}`
      );

    } catch (error) {
      console.error("Error updating prefix:", error);
      return message.reply(
        "An error occurred while updating the prefix. Please try again later."
      );
    }
  },
};