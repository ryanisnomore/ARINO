const Playlist = require("../../Models/Playlist.js");

module.exports = {
  name: "pl-add",
  aliases: ["pladd", "padd"],
  category: "Playlist",
  description: "Add a song to your playlist using its name or URL.",
  usage: "<playlist name> <song name or URL>",
  options: {
    owner: false,
    inVc: false,
    sameVc: false,
    player: false,
    premium: false,
    vote: false,
  },

  run: async ({ client, message, args }) => {
    try {
      if (args.length < 2) {
        return message.reply(
          `<:octoError:1270923372599185408> **Missing Arguments**: **Please provide the playlist name and song name/URL**.\nUsage: \`${client.prefix}pl-add <playlist name> <song name or URL>\``
        );
      }

      const playlistName = args[0];
      const songQuery = args.slice(1).join(" ");

      const playlist = await Playlist.findOne({
        UserId: message.author.id,
        PlaylistName: playlistName,
      });

      if (!playlist) {
        return message.reply(
          `<:octoError:1270923372599185408> **Playlist Not Found**: You don't have a playlist named **${playlistName}**. Create one using the \`pl-create\` command!`
        );
      }

      const searchResult = await client.kazagumo.search(songQuery, {
        requester: message.author,
      });

      if (!searchResult?.tracks?.length) {
        return message.reply(
          `<:octoError:1270923372599185408> Song Not Found: No results found for **${songQuery}**. Please provide a valid song name or URL.`
        );
      }

      const track = searchResult.tracks[0];
      playlist.Playlist.push({
        title: track.title,
        uri: track.uri,
        author: track.author || "Unknown",
        duration: track.length || null,
      });

      await playlist.save();

      return message.reply(
        `- Added **${track.title}** to playlist **${playlistName}**.`
      );
    } catch (error) {
      console.error("Error in pl-add command:", error);
      return message.reply(
        "<:octoError:1270923372599185408> An Error Occurred: Unable to add the song to the playlist. Please try again later."
      );
    }
  },
};
