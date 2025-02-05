module.exports = {
  name: "say",
  aliases: ["say"],
  category: "",
  description: "Send a message as the bot",
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
  run: async ({ client, message, args }) => {
    // Get the message to send
    let msg = args.join(" ");
    if (!msg) {
      return message.reply({
        content: `${client.emoji.error} Please provide a message for me to say!`,
      });
    }

    try {
      // Delete the original message (if possible)
      await message.delete().catch(() => {});

      // Send the provided message
      await message.channel.send({
        content: msg,
        allowedMentions: { repliedUser: false, parse: ["users"] },
      });
    } catch (e) {
      // Catch any errors and send a failure message
      console.error(e);
      return message.reply({
        content: `${client.emoji.error} An error occurred while trying to send the message.`,
      });
    }
  },
};
