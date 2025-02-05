const { EmbedBuilder } = require("discord.js");
const Playlist = require("../../Models/Playlist.js"); // Correct import

module.exports = {
  name: "pl-addcurrent",
  aliases: ["pl-addcurrent", "plnow"],
  category: "Playlist",
  description: "Add the currently playing song to your playlist.",
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
    const playlistName = args.join(" ");
    if (!playlistName) {
      return message.reply({ content: "Please provide a playlist name." });
    }

    const player = client.kazagumo.players.get(message.guildId);
    if (!player || !player.queue.current) {
      return message.reply({ content: "No music is playing currently." });
    }

    const song = player.queue.current;
    const songData = {
      title: song.title,
      uri: song.uri,
      author: song.author || "Unknown",
      duration: song.duration || null,
    };

    try {
      // Check if the playlist exists using the correct field names from the schema
      let playlist = await Playlist.findOne({
        UserId: message.author.id, // Correct key for UserId
        PlaylistName: playlistName, // Correct key for PlaylistName
      });

      // If the playlist does not exist, create it
      if (!playlist) {
        playlist = new Playlist({
          Username: message.author.username,
          UserId: message.author.id, // Correct key for UserId
          PlaylistName: playlistName, // Correct key for PlaylistName
          Playlist: [], // Ensure the Playlist is an array
          CreatedOn: Date.now(),
        });

        await playlist.save();
        message.reply({
          content: `Playlist "${playlistName}" not found. A new playlist has been created.`,
        });
      }

      // Add the current song to the playlist
      const updateResult = await Playlist.updateOne(
        { UserId: message.author.id, PlaylistName: playlistName }, // Correct query
        { $push: { Playlist: songData } } // Ensure Playlist field is updated
      );

      if (updateResult.modifiedCount > 0) {
        return message.reply({
          content: `- Added **${song.title}** to playlist **${playlistName}**.`,
        });
      } else {
        return message.reply({
          content: "An error occurred while updating the playlist.",
        });
      }
    } catch (error) {
      console.error(error);
      return message.reply({
        content: "An error occurred while adding the song to the playlist.",
      });
    }
  },
};
