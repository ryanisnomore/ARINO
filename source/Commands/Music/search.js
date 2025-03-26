const {
  ActionRowBuilder,
  ButtonBuilder,
  AttachmentBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const { createCanvas } = require("canvas");
const { getLyrics } = require("genius-lyrics-api");
const SpotiPro = require("spoti-pro");
const axios = require("axios");

const api = "put-your-one";
const spotify = new SpotiPro(
  "83c98500a89a4a5eae6fa819643644b8",
  "b2627d1bf6c846d98e102fe58e656892",
  { cacheEnabled: true }
);

module.exports = {
  name: "search",
  aliases: ["ser"],
  category: "Music",
  desc: "Search a song of your favorite choice",
  dev: false,
  options: {
    owner: false,
    inVc: true,
    sameVc: false,
    player: {
      playing: false,
      active: false,
    },
    premium: false,
    vote: false,
  },

  run: async ({ client, message, args }) => {
    try {
      // Check if user is in a voice channel
      if (!message.member.voice.channel) {
        return client.message.send(message, {
          content: "You need to be in a **voice channel** to play music.",
        });
      }

      // Validate query
      const query = args.join(" ");
      if (!query) {
        return client.message.send(message, {
          content: "Provide a song name or URL to search. Example: `search Faded`",
        });
      }

      // Handle URL input
      const urlRegex =
        /^((?:https?:\/\/)?(?:www\.)?(?:[\w-]+\.)+[\w]{2,63}(?:\/[\w-\./?%&=]*)?)$/i;
      if (!urlRegex.test(query)) {
        // Search songs based on the query
        let searchingMessage = await message.channel.send({
          content: "- Searching songs... Please wait!",
        });

        const songs = await searchSongs(client, query, message);
        if (!songs.length) {
          return client.message.send(message, {
            content: "No songs found for the given query.",
          });
        }

        // Display the search results
        const msg = await sendInitialMessage(message, songs, 0);
        await searchingMessage.delete();

        const collector = await createCollector(msg, message.author.id);
        handleCollector(collector, msg, songs, message, client);
      } else {
        // Handle direct URL input
        const track = await client.kazagumo.search(query, {
          requester: message.author,
        });

        if (!track) {
          return client.message.send(message, {
            content: "No songs found for the given query.",
          });
        }

        const player =
          client.kazagumo.getPlayer(message.guild.id) ||
          (await client.kazagumo.createPlayer({
            guildId: message.guild.id,
            textId: message.channel.id,
            voiceId: message.member.voice.channel.id,
            shardId: message.guild.shardId,
            deaf: true,
          }));

        player.queue.add(track.tracks);
        if (!player.playing && !player.paused) {
          try {
            await player.play();
          } catch (error) {
            console.error("Error playing track:", error);
            return client.message.send(message, {
              content: "Error occurred while trying to play the track.",
            });
          }
        }

        const embed = createAddedToQueueEmbed(track.tracks[0], message, client);
        return client.message.send(message, { embeds: [embed] });
      }
    } catch (error) {
      console.error("Error in search command:", error);
      return client.message.send(message, {
        content: "An unexpected error occurred. Please try again later.",
      });
    }
  },
};

// Search songs function
async function searchSongs(client, query, message) {
  try {
    const res = await client.kazagumo.search(query, {
      source: "ytsearch:",
      requester: message.author,
    });
    if (!res.tracks || res.tracks.length === 0) return [];
    return res.tracks.slice(0, 10); // Return top 10 songs
  } catch (error) {
    console.error("Error in searchSongs:", error);
    return [];
  }
}

// Initial message for search results
async function sendInitialMessage(message, songs, selectedIndex) {
  const attachment = new AttachmentBuilder(
    await createSongListImage(songs, selectedIndex),
    { name: "songs.png" }
  );

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("select-song")
    .setPlaceholder("Select a song")
    .addOptions(
      songs.map((song, index) => ({
        label: song.title.length > 100 ? song.title.slice(0, 97) + "..." : song.title, // Truncate title if necessary
        value: song.uri,
      }))
    );

  const components = [new ActionRowBuilder().addComponents(selectMenu)];

  return message.channel.send({
    files: [attachment],
    components,
  });
}

// Collector for menu interactions
function createCollector(msg, authorId) {
  const filter = (interaction) => interaction.user.id === authorId;
  return msg.createMessageComponentCollector({
    filter,
    time: 300000,
  });
}

// Handles user interactions with menu
function handleCollector(collector, msg, songs, message, client) {
  collector.on("collect", async (interaction) => {
    try {
      const selectedSong = songs.find((song) => song.uri === interaction.values[0]);
      if (selectedSong) {
        await playSong(client, message, selectedSong);
        const embed = createAddedToQueueEmbed(selectedSong, message, client);
        await msg.edit({ embeds: [embed], components: [] });
        return;
      }
    } catch (error) {
      console.error("Error in collector:", error);
    }
  });

  collector.on("end", () => {
    msg.edit({ components: [] }); // Disable buttons after timeout
  });
}

// Add song to queue and play
async function playSong(client, message, song) {
  const player =
    client.kazagumo.getPlayer(message.guild.id) ||
    (await client.kazagumo.createPlayer({
      guildId: message.guild.id,
      textId: message.channel.id,
      voiceId: message.member.voice.channel.id,
      shardId: message.guild.shardId,
      deaf: true,
    }));

  player.queue.add(song);
  if (!player.playing && !player.paused) await player.play();
}

// Create an embed for adding to queue
function createAddedToQueueEmbed(song, message, client) {
  return new EmbedBuilder()
    .setTitle("Added to Queue")
    .setDescription(`[${song.title}](${song.uri}) has been added to the queue.`)
    .setColor("#2f3136")
    .setFooter({
      text: `Requested by ${message.author.tag}`,
      iconURL: message.author.displayAvatarURL(),
    });
}

// Create song list image
async function createSongListImage(songs, selectedIndex) {
  const canvas = createCanvas(500, 700);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "20px Arial";
  songs.forEach((song, index) => {
    ctx.fillText(`${index + 1}. ${song.title}`, 20, 30 + index * 30);
  });

  return canvas.toBuffer();
}
