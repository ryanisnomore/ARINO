const Playlist = require("../../Models/Playlist.js");

module.exports = {
  name: "pl-delete",
  aliases: ["pldelete", "pdel"],
  category: "Playlist",
  description: "Delete a playlist by name.",
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
        "<:octoError:1270923372599185408> Please provide the name of the playlist to delete."
      );
    }

    try {
      const data = await Playlist.findOne({
        UserId: message.author.id,
        PlaylistName: playlistName,
      });

      if (!data) {
        return message.reply(
          `<:octoError:1270923372599185408> You don't have a playlist named **${playlistName}**.`
        );
      }

      await data.deleteOne();

      return message.reply(
        `- Succeeded To Delete  **${playlistName}**.`
      );
      
    } catch (error) {
      console.error(error);
      return message.reply(
        "<:octoError:1270923372599185408> An error occurred while deleting the playlist."
      );
    }
  },
};