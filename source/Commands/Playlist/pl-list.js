const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");
const Playlist = require("../../Models/Playlist.js");
const lodash = require("lodash");

module.exports = {
  name: "pl-list",
  aliases: ["pllist", "plist"],
  category: "Playlist",
  description: "View a list of your playlists.",
  usage: "",
  options: {
    owner: false,
    inVc: false,
    sameVc: false,
    player: false,
    premium: false,
    vote: false,
  },
  run: async ({ client, message, args, prefix }) => {
    const color = client.config.color || "#7289DA"; // Default embed color

    try {
      // Fetch user's playlists from the database
      const data = await Playlist.find({ UserId: message.author.id });

      // If no playlists exist for the user
      if (!data.length) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(color)
              .setDescription("<:octoError:1270923372599185408> You do not have any playlists."),
          ],
        });
      }

      // Format playlists into a readable list
      const list = data.map(
        (x, i) =>
          `\`${i + 1}\` - **${x.PlaylistName}** (${x.Playlist.length} tracks) - <t:${Math.floor(
            x.CreatedOn / 1000
          )}:D>`
      );

      // Paginate playlists (10 items per page)
      const pages = lodash.chunk(list, 10).map((chunk) => chunk.join("\n"));
      let page = 0;

      // Embed setup for displaying playlists
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${message.author.username}'s Playlist`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setColor(color)
        .setFooter({ text: `Page ${page + 1} of ${pages.length}` })
        .setDescription(pages[page]);

      // If there's only one page, send the embed without buttons
      if (pages.length <= 1) {
        return message.channel.send({ embeds: [embed] });
      }

      // Buttons for pagination
      const previousButton = new ButtonBuilder()
        .setCustomId("previous")
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Secondary);

      const stopButton = new ButtonBuilder()
        .setCustomId("stop")
        .setEmoji("⏹️")
        .setStyle(ButtonStyle.Secondary);

      const nextButton = new ButtonBuilder()
        .setCustomId("next")
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(
        previousButton,
        stopButton,
        nextButton
      );

      const messageWithButtons = await message.channel.send({
        embeds: [embed],
        components: [row],
      });

      // Collector for button interactions
      const collector = messageWithButtons.createMessageComponentCollector({
        filter: (interaction) => interaction.user.id === message.author.id,
        time: 5 * 60 * 1000, // 5 minutes
      });

      collector.on("collect", async (interaction) => {
        if (!interaction.isButton()) return;

        if (interaction.customId === "previous") {
          page = page - 1 < 0 ? pages.length - 1 : page - 1;
        } else if (interaction.customId === "next") {
          page = page + 1 >= pages.length ? 0 : page + 1;
        } else if (interaction.customId === "stop") {
          collector.stop();
          return;
        }

        embed.setDescription(pages[page]).setFooter({
          text: `Page ${page + 1} of ${pages.length}`,
        });

        await interaction.update({ embeds: [embed] });
      });

      collector.on("end", async () => {
        if (!messageWithButtons) return;

        // Disable buttons after the collector ends
        await messageWithButtons.edit({
          components: [
            new ActionRowBuilder().addComponents(
              previousButton.setDisabled(true),
              stopButton.setDisabled(true),
              nextButton.setDisabled(true)
            ),
          ],
        });
      });
    } catch (error) {
      console.error(error);

      // Send an error message if something goes wrong
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription("<:octoError:1270923372599185408> An error occurred while fetching your playlists."),
        ],
      });
    }
  },
};
