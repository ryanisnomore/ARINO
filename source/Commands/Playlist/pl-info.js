const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const Playlist = require("../../Models/Playlist.js");
const ms = require("ms");
const lodash = require("lodash");

module.exports = {
  name: "pl-info",
  aliases: ["plinfo", "pinfo"],
  category: "Playlist",
  description: "Get detailed information about a specific playlist.",
  usage: "<playlist name>",
  options: {
    owner: false,
    inVc: false,
    sameVc: false,
    player: false,
    premium: false,
    vote: false,
  },
  run: async ({ client, message, args, prefix }) => {
    const color = client.config.color || "#7289DA";

    try {
      const playlistName = args.join(" ");
      if (!playlistName) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(color)
              .setTitle("<:octoError:1270923372599185408> Missing Playlist Name")
              .setDescription("Please provide the name of the playlist.")
              .setFooter({ text: `Usage: ${prefix}pl-info <playlist name>` }),
          ],
        });
      }

      const data = await Playlist.findOne({
        UserId: message.author.id,
        PlaylistName: playlistName,
      });

      if (!data) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(color)
              .setTitle("<:octoError:1270923372599185408> Playlist Not Found")
              .setDescription(`You don't have a playlist named **${playlistName}**.`)
              .setFooter({ text: "Create one using the pl-create command!" }),
          ],
        });
      }

      if (!data.Playlist || data.Playlist.length === 0) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(color)
              .setTitle("<:octoError:1270923372599185408> Empty Playlist")
              .setDescription(`Your playlist **${playlistName}** is empty.`)
              .setFooter({ text: "Add songs using the pl-add command!" }),
          ],
        });
      }

      const tracks = data.Playlist.map((track, index) => {
        const title = track.title || "Unknown Title";
        const uri = track.uri || "#";
        const duration = track.duration ? `\`${ms(track.duration)}\`` : "Unknown Duration";
        return `\`${index + 1}\` - [${title}](${uri}) ${duration}`;
      });

      const pages = lodash.chunk(tracks, 10).map((chunk) => chunk.join("\n"));
      let page = 0;

      // Updated embed with author field
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${message.author.username}'s Playlist: ${playlistName}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setColor(color)
        .setDescription(
          `- **Total Tracks**: \`${data.Playlist.length}\`\n\n${pages[page]}`
        )
        .setFooter({ text: `Page ${page + 1} of ${pages.length}` })
        .setTimestamp();

      if (pages.length <= 1) {
        return message.reply({ embeds: [embed] });
      }

      const previousButton = new ButtonBuilder()
        .setCustomId("plinfo_previous")
        .setLabel("Previous")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("⬅️")
        .setDisabled(page === 0);

      const stopButton = new ButtonBuilder()
        .setCustomId("plinfo_stop")
        .setLabel("Stop")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("⏹️");

      const nextButton = new ButtonBuilder()
        .setCustomId("plinfo_next")
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("➡️")
        .setDisabled(page === pages.length - 1);

      const row = new ActionRowBuilder().addComponents(
        previousButton,
        stopButton,
        nextButton
      );

      const messageWithButtons = await message.reply({
        embeds: [embed],
        components: [row],
      });

      const collector = messageWithButtons.createMessageComponentCollector({
        filter: (interaction) => interaction.user.id === message.author.id,
        time: 5 * 60 * 1000,
      });

      collector.on("collect", async (interaction) => {
        if (!interaction.isButton()) return;

        if (interaction.customId === "plinfo_previous") {
          page = Math.max(page - 1, 0);
        } else if (interaction.customId === "plinfo_next") {
          page = Math.min(page + 1, pages.length - 1);
        } else if (interaction.customId === "plinfo_stop") {
          collector.stop();
          return;
        }

        previousButton.setDisabled(page === 0);
        nextButton.setDisabled(page === pages.length - 1);

        embed.setDescription(
          `- **Total Tracks**: \`${data.Playlist.length}\`\n\n${pages[page]}`
        ).setFooter({ text: `Page ${page + 1} of ${pages.length}` });

        await interaction.update({
          embeds: [embed],
          components: [new ActionRowBuilder().addComponents(previousButton, stopButton, nextButton)],
        });
      });

      collector.on("end", async () => {
        if (!messageWithButtons) return;

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

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setTitle("<:octoError:1270923372599185408> An Error Occurred")
            .setDescription("An error occurred while fetching the playlist.")
            .setFooter({ text: "Please try again later." }),
        ],
      });
    }
  },
};