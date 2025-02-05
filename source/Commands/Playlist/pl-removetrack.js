const Playlist = require("../../Models/Playlist.js");

module.exports = {
  name: "pl-removetrack",
  aliases: ["plremtrack", "plrem"],
  category: "Playlist",
  description: "Remove a track from your playlist by its index.",
  usage: "<playlist name> <track number>",
  options: {
    owner: false,
    inVc: false,
    sameVc: false,
    player: false,
    premium: false,
    vote: false,
  },

  run: async ({ client, message, args }) => {
    const playlistName = args[0];
    const trackIndex = parseInt(args[1], 10);

    if (!playlistName) {
      return message.reply(
        "<:octoError:1270923372599185408> You need to specify the playlist name."
      );
    }

    if (isNaN(trackIndex) || trackIndex < 1) {
      return message.reply(
        "<:octoError:1270923372599185408> Please provide a valid track number (starting from 1)."
      );
    }

    try {
      const playlist = await Playlist.findOne({
        UserId: message.author.id,
        PlaylistName: playlistName,
      });

      if (!playlist) {
        return message.reply(
          `<:octoError:1270923372599185408> No playlist found with the name **${playlistName}**.`
        );
      }

      const tracks = playlist.Playlist;
      if (trackIndex < 1 || trackIndex > tracks.length) {
        return message.reply(
          `<:octoError:1270923372599185408> Invalid track number. Please provide a number between **1** and **${tracks.length}**.`
        );
      }

      const removedTrack = tracks.splice(trackIndex - 1, 1)[0];
      await Playlist.updateOne(
        { UserId: message.author.id, PlaylistName: playlistName },
        { $set: { Playlist: tracks } }
      );

      return message.reply(
        `- Removed track **${removedTrack.title}** from **${playlistName}**`
      );

    } catch (error) {
      console.error(error);
      return message.reply(
        "<:octoError:1270923372599185408> An error occurred while removing the track from the playlist."
      );
    }
  },
};