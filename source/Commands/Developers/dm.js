module.exports = {
  name: "dm",
  aliases: ["dm"],
  category: "",
  description: "Send a direct message to a user",
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
    let user;

    // Check if the user is mentioned or if an ID is provided
    if (message.mentions.users.size > 0) {
      user = message.mentions.users.first();
    } else if (args[0]) {
      try {
        user = await client.users.fetch(args[0]);
      } catch (e) {
        return message.reply({
          embeds: [
            client.utils.errorEmbed().setDescription(`Could not find a valid user with that ID!`),
          ],
        });
      }
    }

    // If no user found, return an error
    if (!user) {
      return message.reply({
        embeds: [
          client.utils.errorEmbed().setDescription(`Please provide me a valid user!`),
        ],
      });
    }

    // Get the message to send
    const msg = args.slice(1).join(" ");
    if (!msg) {
      return message.reply({
        embeds: [
          client.utils.errorEmbed().setDescription(`Please provide me a message to be sent!`),
        ],
      });
    }

    try {
      await message.delete().catch(() => {}); // Try to delete the command message
      await user.send({ content: msg }); // Send the DM to the user
      return message
        .reply({
          embeds: [
            client.utils.successEmbed().setDescription(`Successfully sent DM to **${user.tag}**`),
          ],
        })
        .then((x) => {
          setTimeout(() => {
            x.delete().catch(() => {}); // Delete the success reply after 3 seconds
          }, 3000);
        });
    } catch (e) {
      return message
        .reply({
          embeds: [
            client.utils.errorEmbed().setDescription(`Unable to send DM to **${user.tag}**`),
          ],
        })
        .then((x) => {
          setTimeout(() => {
            x.delete().catch(() => {}); // Delete the error reply after 3 seconds
          }, 3000);
        });
    }
  },
};
