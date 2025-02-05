const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const SpotiPro = require("spoti-pro");
const Playlist = require("../../Models/Playlist.js");

const spotify = new SpotiPro(
  "83c98500a89a4a5eae6fa819643644b8",
  "b2627d1bf6c846d98e102fe58e656892",
  { cacheEnabled: true }
);

module.exports = {
  name: "pl-load",
  aliases: ["plload"],
  category: "Playlist",
  description: "Load and play songs from a playlist.",
  options: {
    owner: false,
    inVc: true,
    sameVc: true,
    player: {
      playing: false,
      active: false,
    },
    premium: false,
    vote: false,
  },

  run: async ({ client, message, args }) => {
    try {
      if (!message.member.voice.channel) {
        return message.channel.send(
          "<:octoError:1270923372599185408> You need to be in a **voice channel** to load a playlist."
        );
      }

      const playlistName = args.join(" ").trim();
      if (!playlistName) {
        return message.channel.send(
          "<:octoError:1270923372599185408> Please provide a playlist name. Example: `load MyPlaylist`"
        );
      }

      const playlist = await Playlist.findOne({
        UserId: message.author.id,
        PlaylistName: playlistName,
      });

      if (!playlist?.Playlist?.length) {
        return message.channel.send(
          `<:octoError:1270923372599185408> Playlist **${playlistName}** is empty or doesn't exist.`
        );
      }

      const msg = await sendPlaylistPreview(message, playlist.Playlist, playlistName);
      const collector = createCollector(msg, message.author.id);

      collector.on("collect", async (interaction) => {
        if (interaction.customId === "load") {
          await interaction.deferUpdate();
          
          await interaction.editReply({
            content: `<a:DaisyLoading:1271046875541278791> Loading **${playlist.Playlist.length}** songs from **${playlistName}**...`,
            components: [],
          });

          const tracks = await searchAndAddSongs(client, playlist.Playlist, message);
          
          const resultMsg = tracks.length > 0 
            ? `- Loaded **${tracks.length}** songs from **${playlistName}**`
            : "<:octoError:1270923372599185408> No valid songs found in the playlist.";

          return interaction.editReply({
            content: resultMsg,
            components: [],
          });
        }
        
        if (interaction.customId === "cancel") {
          await interaction.deferUpdate();
          return interaction.editReply({
            content: "<:octoError:1270923372599185408> Playlist loading cancelled.",
            components: [],
          });
        }
      });

      collector.on("end", () => msg.edit({ components: [] }));

    } catch (error) {
      console.error("Error in load command:", error);
      return message.channel.send(
        "<:octoError:1270923372599185408> An unexpected error occurred. Please try again later."
      );
    }
  },
};

async function sendPlaylistPreview(message, songs, playlistName) {
  const previewText = 
    `<:HvnMusic:1270904422729383985> **${playlistName}** - ${songs.length} tracks\n` +
    songs.slice(0, 5).map((s, i) => `${i+1}. ${s.title}${s.author ? ` - ${s.author}` : ''}`).join('\n') +
    (songs.length > 5 ? `\n...and ${songs.length - 5} more` : "");

  const components = [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("load")
        .setLabel("Confirm")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("cancel")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Danger)
    )
  ];

  return message.channel.send({
    content: previewText,
    components,
  });
}

function createCollector(msg, authorId) {
  return msg.createMessageComponentCollector({
    filter: i => i.user.id === authorId,
    time: 300000,
  });
}

async function searchAndAddSongs(client, songs, message) {
  const player = client.kazagumo.getPlayer(message.guild.id) || 
    await client.kazagumo.createPlayer({
      guildId: message.guild.id,
      textId: message.channel.id,
      voiceId: message.member.voice.channel.id,
      deaf: true,
    });

  const addedTracks = [];
  for (const song of songs) {
    try {
      const query = song.url || `${song.title} ${song.author || ""}`;
      const result = await client.kazagumo.search(query, {
        requester: message.author,
        source: song.url ? undefined : "ytsearch:"
      });

      if (result.tracks?.length) {
        player.queue.add(result.tracks[0]);
        addedTracks.push(result.tracks[0]);
      }
    } catch (error) {
      console.error(`Error loading track: ${song.title}`, error);
    }
  }

  if (!player.playing && player.queue.size > 0) await player.play();
  return addedTracks;
}