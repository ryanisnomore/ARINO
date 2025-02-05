const Playlist = require("../../Models/Playlist.js");

module.exports = {
  name: "pl-create",
  aliases: ["plcreate", "pc"],
  category: "Playlist",
  description: "Create a new playlist.",
  args: true,
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
    const playlistName = args.join(" ").trim();

    if (!playlistName) {
      return message.reply(
        "<:octoError:1270923372599185408> Please provide a valid playlist name."
      );
    }

    if (playlistName.length > 10) {
      return message.reply(
        "<:octoError:1270923372599185408> Playlist name cannot exceed 10 characters."
      );
    }

    try {
      const existingPlaylist = await Playlist.findOne({
        UserId: message.author.id,
        PlaylistName: playlistName,
      });

      if (existingPlaylist) {
        return message.reply(
          `<:octoError:1270923372599185408> This playlist already exists! You can delete it using: \`${prefix}playlist-delete ${playlistName}\`.`
        );
      }

      const userPlaylists = await Playlist.find({ UserId: message.author.id });
      if (userPlaylists.length >= 10) {
        return message.reply(
          "<:octoError:1270923372599185408> You can only create a maximum of 10 playlists."
        );
      }

      const newPlaylist = new Playlist({
        Username: message.author.username,
        UserId: message.author.id,
        PlaylistName: playlistName,
        Playlist: [],
        CreatedOn: Math.round(Date.now() / 1000),
      });

      await newPlaylist.save();

      return message.reply(
        `- Succeeded To Create **${playlistName}**`
      );
      
    } catch (error) {
      console.error(error);
      return message.reply(
        "<:octoError:1270923372599185408> An error occurred while creating the playlist."
      );
    }
  },
};