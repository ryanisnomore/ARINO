const { EmbedBuilder } = require("discord.js");
const Playlist = require("../../Models/Playlist.js");

module.exports = {
  name: "pl-profile",
  aliases: ["plprofile", "plpr"],
  category: "Playlist",
  description: "View your playlist profile, including total playlists and songs.",
  options: {
    owner: false,
    inVc: false,
    sameVc: false,
    player: false,
    premium: false,
    vote: false,
  },

  run: async ({ client, message }) => {
    try {
      const userId = message.author.id;
      const userDisplayName = message.author.username;
      const userAvatar = message.author.displayAvatarURL({ dynamic: true });

      const playlists = await Playlist.find({ UserId: userId });

      if (!playlists || playlists.length === 0) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FF0000")
              .setAuthor({
                name: `${userDisplayName}'s Playlist Profile`,
                iconURL: userAvatar
              })
              .setTitle("<:octoError:1270923372599185408> No Playlists Found")
              .setDescription("Create one using the `pl-create` command!")
              .setThumbnail(userAvatar),
          ],
        });
      }

      const totalPlaylists = playlists.length;
      const totalSongs = playlists.reduce((acc, playlist) => acc + (playlist.Playlist?.length || 0), 0);

      const embed = new EmbedBuilder()
        .setColor("#2f3136")
        .setAuthor({
          name: `${userDisplayName}'s Playlist Profile`,
          iconURL: userAvatar
        })
        .setThumbnail(userAvatar)
        .addFields(
          { name: "- **Total Playlists**", value: `\`${totalPlaylists}\``, inline: true },
          { name: "- **Total Songs**", value: `\`${totalSongs}\``, inline: true }
        )
        .setFooter({ text: "Use pl-info to view details of a specific playlist." });

      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error in pl-profile command:", error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("<:octoError:1270923372599185408> Unexpected Error")
            .setDescription("An error occurred while fetching your playlist profile. Please try again later."),
        ],
      });
    }
  },
};