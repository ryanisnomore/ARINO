const Playlist = require("../../Models/Playlist.js");

module.exports = {
  name: "pl-addqueue",
  aliases: ["pladdq", "paddq"],
  category: "Playlist",
  description: "Add the current queue to your playlist.",
  usage: "<playlist name>",
  options: {
    owner: false,
    inVc: true,
    sameVc: true,
    player: true,
    premium: false,
    vote: false,
  },
  run: async ({ client, message, args }) => {
    const playlistName = args.join(" ").trim();

    if (!playlistName) {
      return message.reply(
        "<:octoError:1270923372599185408> **Missing Arguments**: Please provide a valid playlist name."
      );
    }

    const player = client.kazagumo.players.get(message.guildId);

    if (!player?.queue.current) {
      return message.reply(
        "<:octoError:1270923372599185408> **No Active Player**: There is no music currently playing."
      );
    }

    try {
      let playlist = await Playlist.findOne({
        UserId: message.author.id,
        PlaylistName: playlistName,
      });

      if (!playlist) {
        playlist = new Playlist({
          Username: message.author.username,
          UserId: message.author.id,
          PlaylistName: playlistName,
          Playlist: [],
          CreatedOn: Date.now(),
        });
        await playlist.save();
        await message.reply(
          `<:octoError:1270923372599185408> **Playlist Created**: Playlist "${playlistName}" not found. A new playlist has been created.`
        );
      }

      const songsToAdd = [];
      
      // Add current track
      if (player.queue.current) {
        songsToAdd.push({
          title: player.queue.current.title,
          uri: player.queue.current.uri,
          author: player.queue.current.author || "Unknown",
          duration: player.queue.current.duration || 0,
        });
      }

      // Add queued tracks
      player.queue.tracks.forEach(track => {
        songsToAdd.push({
          title: track.title,
          uri: track.uri,
          author: track.author || "Unknown",
          duration: track.duration || 0,
        });
      });

      if (songsToAdd.length === 0) {
        return message.reply(
          "<:octoError:1270923372599185408> **Empty Queue**: There are no tracks in the queue to add to the playlist."
        );
      }

      await Playlist.updateOne(
        { UserId: message.author.id, PlaylistName: playlistName },
        { $push: { Playlist: { $each: songsToAdd } } }
      );

      return message.reply(
        `<:HvnMusic:1270904422729383985> **Queue Added**: Successfully added **${songsToAdd.length} tracks** to playlist **${playlistName}**`
      );
      
    } catch (error) {
      console.error("Error adding queue to playlist:", error);
      return message.reply(
        "<:octoError:1270923372599185408> **Server Error**: An error occurred while processing your request. Please try again later."
      );
    }
  },
};