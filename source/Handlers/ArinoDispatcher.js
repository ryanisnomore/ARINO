const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ChannelType,
} = require("discord.js");
const GuildSchema = require("../Models/Guild");
const fs = require("fs");
const path = require("path");
const { Classic } = require("musicard");
const SpotiPro = require("spoti-pro");

const Spotify_ID = "83c98500a89a4a5eae6fa819643644b8";
const Spotify_Secret = "b2627d1bf6c846d98e102fe58e656892";

const spotipro = new SpotiPro(Spotify_ID, Spotify_Secret, { cacheEnabled: false });

module.exports = async function AvonDispatcher(client, kazagumo) {
  kazagumo.on("playerStart", async (player, track) => {
    if (track.length < 5000) {
      player.skip();
      let channel = client.channels.cache.get(player.textId);
      if (channel) {
        channel
          .send({
            content: `- Track is less than **5 seconds.** Skipping the track.`,
          })
          .then((msg) => setTimeout(() => msg.delete(), 5000));
      }
      return;
    }
    let guildData = await GuildSchema.findOne({ id: player.guildId });
    const channel = client.channels?.cache.get(player.textId);
    let data = await spotipro.searchTrack(track.title); // Using spotipro search for track info
    let title, author, url, artistLink, thumbnail;

    title = data.title;
    author = data.artist;
    url = data.link;
    artistLink = data.artistLink;
    thumbnail = data.thumbnail; // Get the track's thumbnail

    player.queue.current.title = title;
    player.data.set("url", url);
    player.data.set("autoplayTrack", track);
    let ops = `[**${
      track.requester.globalName
        ? track.requester.globalName
        : track.requester.username
    }**](https://discord.com/users/${track.requester.id})`;

    client.utils.setVCStatus(
      player.voiceId,
      `<a:arino_disk:1324716970335146147> ${title} by ${author}`
    );

    // Get start and end times formatted
    const startTime = await client.utils.convertTime(player.position);
    const endTime = await client.utils.convertTime(track.length);

    // Generate music card
    const musicard = await Classic({
      thumbnailImage: thumbnail,  // Use the thumbnail from Spotify
      backgroundColor: '#070707',
      progress: 10,
      progressColor: '#FF7A00',
      progressBarColor: '#5F2D00',
      name: title,
      nameColor: '#FF7A00',
      author: author,
      authorColor: '#696969',
      startTime: startTime,
      endTime: endTime,
      timeColor: '#FF7A00',
    });

    // Save the generated music card image
    fs.writeFileSync('musicard.png', musicard);

    // Embed with the generated music card
    const nowPlaying = new EmbedBuilder()
      .setAuthor({
        name: `ARINO PLAYER`,
        iconURL: track.requester.displayAvatarURL({ dynamic: true }),
        url: track.uri,
      })
      .setColor(client.config.color)
      .setImage('attachment://musicard.png') // Use the music card image
      .setDescription(
        `**[${
          title.length > 20 ? `${title.slice(0, 20)}...` : title
        }](${url})**`
      )
      .setFooter({
        text: `Autoplay: ${guildData.settings.autoplay ? "Yes" : "No"} | Volume: ${player.volume}% | Queue: ${player.queue.length}`,
        iconURL: track.requester.displayAvatarURL({ dynamic: true }),
      });

    const buttonsRow = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("previous")
    .setStyle("Primary")  // Set to blue
    .setEmoji("1131847086053269575"),
  new ButtonBuilder()
    .setCustomId("PauseAndResume")
    .setEmoji(player.paused ? "1131847088884437063" : "1131847861299068948")
    .setStyle(player.paused ? client.btn.green : client.btn.grey),
  new ButtonBuilder()
    .setCustomId("stop")
    .setEmoji("1271435231471341580")
    .setStyle(client.btn.red),
  new ButtonBuilder()
    .setEmoji("1131847099361792082")
    .setCustomId("settings")
    .setStyle(client.btn.grey),
  new ButtonBuilder()
    .setEmoji("1131847093925969990")
    .setCustomId("skip")
    .setStyle("Primary")  // Set to blue
);
    const buttonsRow2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("like")
        .setEmoji("1301594300639084635")
        .setStyle(client.btn.green),
      new ButtonBuilder()
        .setCustomId("music_invite")
        .setEmoji("1301356058769621042")
        .setStyle(client.btn.blue),
      new ButtonBuilder()
        .setCustomId("lyrics")
        .setEmoji("1205176894665003008")
        .setStyle(client.btn.blue)
    );

    if (player.volume > 100) {
      nowPlaying.setDescription(
        `**[${
          title.length > 20 ? `${title.slice(0, 20)}...` : title
        }](${url})**\n-# **Note:** *Volume is slightly higher than usual, may cause distortion*`
      );
    }

    if (channel) {
      await channel
        ?.send({ embeds: [nowPlaying], components: [buttonsRow, buttonsRow2], files: ['musicard.png'] })
        .then((msg) => player.data.set("message", msg));
    } else {
      player.destroy();
      let channelGuild = client.guilds.cache.get(player.guildId);
      let channels = channelGuild.channels.cache.filter(
        (c) => c.type === ChannelType.GuildText
      );
      await client.channels.cache
        .get(channels.first().id)
        .send({
          content: `I can't find the text channel to send the message. So Destroying the player.`,
        })
        .then((msg) => setTimeout(() => msg.delete(), 8000))
        .catch((err) => console.error(err));
    }
  });

  kazagumo.on("playerEnd", async (player) => {
    const msg = player.data.get("message").id;
    const channel = client.channels.cache.get(player.textId);
    if (channel) {
      if (channel.messages.cache.get(msg)) {
        channel.messages.cache.get(msg).delete();
      }
    }
  });

  kazagumo.on("playerClosed", async (player, track) => {
    const channel = client.channels?.cache.get(player.textId);
    if (channel) {
      channel.messages.fetch(player.data.get("message")).then((msg) => {
        msg.delete();
      });
    }
  });

  kazagumo.on("playerEmpty", async (player) => {
    let prefix = await client.utils.getPrefix(player.guildId);
    client.utils.setVCStatus(
      player.voiceId,
      `${prefix ?? "+"}play <song name> And Enjoy! ARINO`
    );
    player.data.get("message")?.delete();
    let data = await GuildSchema.findOne({ id: player.guildId });
    if (data && data?.settings.autoplay) {
      client.utils.AvonAutoplay(player, player.data?.get("url"));
    } else {
      const embed = new EmbedBuilder().setColor(client.config.color).setAuthor({
        name: `No more tracks in the queue. Leaving the voice channel.`,
        iconURL: client.user.avatarURL(),
      });
      const channel = client.channels.cache.get(player.textId);
      channel
        .send({ embeds: [embed] })
        .then((msg) => setTimeout(() => msg.delete(), 80000 * 10 * 2));
    }
  });

  kazagumo.on("playerDestroy", async (player) => {
    client.utils.removeVCStatus(player.voiceId);
    try {
      let data = await GuildSchema.findOne({ id: player.guildId });
      let shard = await client.guilds.cache.get(data.id).shardId;
      if (data.twentyFourSeven.enabled) {
        await client.kazagumo.createPlayer({
          guildId: data.id,
          textId: data.twentyFourSeven.textChannel,
          voiceId: data.twentyFourSeven.voiceChannel,
          shardId: shard,
          deaf: true,
        });
      }
      if (!player) return;
      if (!player && !player.playing) return;
      const msg = player.data.get("message")
        ? player.data.get("message").id
        : null;
      if (!msg) return;
      const channel = client.channels.cache.get(player.textId);
      if (channel) {
        if (channel.messages.cache.get(msg)) {
          channel.messages.cache.get(msg).delete();
        }
      }
    } catch (e) {
      const player = client.kazagumo.players.get(player.guildId);
      player.destroy();
    }
  });

  kazagumo.on("playerMoved", async (player, state, channels) => {
    client.utils.removeVCStatus(player.voiceId);
    try {
      const newChannel = client.channels.cache.get(channels.newChannelId);
      const oldChannel = client.channels.cache.get(channels.oldChannelId);
      let channel = client.channels.cache.get(player.textId);
      if (channels.newChannelId === channels.oldChannelId) return;
      if (!channel) return;
      if (state === "UNKNOWN") {
        player.destroy();
        return channel
          .send({
            content: `- Unable to move to the new channel. So Destroying the player.`,
          })
          .then((msg) => setTimeout(() => msg.delete(), 8000));
      }
      if (state === "MOVED") {
        player.setVoiceChannel(channels.newChannelId);
        if (player.paused) player.pause(false);
        return channel
          .send({
            content: `- Someone moved me from **${oldChannel.name}** to **${newChannel.name}**`,
          })
          .then((msg) => setTimeout(() => msg.delete(), 8000));
      }
      if (state === "LEFT") {
        let data = await GuildSchema.findOne({ id: player.guildId });
        if (channels.newChannel) {
          player.setVoiceChannel(channels.newChannelId);
        } else {
          if (player) player.destroy();
          let shard = await client.guilds.cache.get(data.id).shardId;
          if (data.twentyFourSeven.enabled) {
            setTimeout(async () => {
              await client.kazagumo.createPlayer({
                guildId: data.id,
                textId: data.twentyFourSeven.textChannel,
                voiceId: data.twentyFourSeven.voiceChannel,
                shardId: shard,
                deaf: true,
              });
            }, 3000);
          } else {
            if (player) player.destroy();
            const oldChannel = client.channels.cache.get(channels.oldChannelId);
            return channel
              .send({
                content: ` - I have been left from **${oldChannel.name}**. Destroying the player.`,
              })
              .then((msg) => setTimeout(() => msg.delete(), 8000));
          }
        }
      }
    } catch (e) {
      const player = client.kazagumo.players.get(player.guildId);
      player.destroy();
    }
  });

  kazagumo.on("playerStuck", async (player, data) => {
    client.utils.removeVCStatus(player.voiceId);
    const channel = client.channels.cache.get(player.textId);
    let msg = player.data.get("message").id;
    if (channel) {
      if (channel.messages.cache.get(msg)) {
        channel.messages.cache.get(msg).delete();
      }
    }
    console.warn(
      `Track is stuck for more than ${data.threshold}ms. Skipping the track in ${player.guildId}`
    );
    if (channel) {
      channel
        .send({
          content: `- Track is stuck for more than ${data.threshold}ms. Skipping the track.`,
        })
        .then((msg) => setTimeout(() => msg.delete(), 5000));
      player.skip();
    }
  });
};
