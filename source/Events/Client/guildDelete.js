const { EmbedBuilder, WebhookClient, ChannelType } = require("discord.js");

module.exports = async (client, guild) => {
  try {
    const owner = await fetchGuildOwner(guild);
    const formatUser = (user) =>
      user
        ? `${user.globalName ? user.globalName : user.username} (${user.id})`
        : "Unknown User";
    const formatTimestamp = (timestamp) => {
      const unixTime = Math.round(timestamp / 1000);
      return `<t:${unixTime}> [<t:${unixTime}:R>]`;
    };
    const guildInfo = [
      `**Guild ID:** ${guild.id}`,
      `**Guild Name:** ${guild.name}`,
      `**Guild Owner:** ${
        owner ? formatUser(owner.user) : "Unable to fetch owner"
      }`,
      `**Member Count:** ${guild.memberCount}`,
      `**Joined At:** ${formatTimestamp(guild.joinedTimestamp)}`,
      `**Guild Created At:** ${formatTimestamp(guild.createdTimestamp)}`,
      `**Shard ID:** ${guild.shardId}`,
    ].join("\n");
    const [serverCount, userCount] = await fetchStats(client);
    const statsInfo = [
      `**Server Count:** ${serverCount}`,
      `**Users Count:** ${userCount}`,
    ].join("\n");
    const embed = new EmbedBuilder()
      .setColor("#00ff00")
      .setAuthor({
        name: "Guild Left",
        iconURL: guild.iconURL({ dynamic: true }) || null,
      })
      .setDescription([guildInfo, statsInfo].join("\n\n"))
      .setThumbnail(guild.iconURL({ dynamic: true, size: 4096 }) || null)
      .setTimestamp();
    await sendNotification(client, embed);
  } catch (error) {
    console.error("Error in guild join event:", error);
    await sendFallbackNotification(client, guild);
  }
};

async function fetchGuildOwner(guild) {
  try {
    return await guild.members.cache.get(guild.ownerId);
  } catch (error) {
    console.error("Error fetching guild owner:", error);
    return null;
  }
}

async function fetchStats(client) {
  try {
    const [serverCount, userCount] = await Promise.all([
      client.cluster
        .fetchClientValues("guilds.cache.size")
        .then((sizes) => sizes.reduce((acc, size) => acc + size, 0)),
      client.cluster
        .broadcastEval((c) =>
          c.guilds.cache.reduce(
            (acc, guild) => acc + (guild.available ? guild.memberCount : 0),
            0
          )
        )
        .then((counts) => counts.reduce((acc, count) => acc + count, 0)),
    ]);
    return [serverCount, userCount];
  } catch (error) {
    console.error("Error fetching stats:", error);
    return [0, 0];
  }
}

async function sendNotification(client, embed) {
  try {
    const webhook = new WebhookClient({ url: `https://discord.com/api/webhooks/1261781112808538282/_zdRHg9Vkw602UYVNtTQnBz2dX_kCsprEcMwh-fO6rx4xFcChDqbxT0oCwCmAYcH3SvP` });
    await webhook.send({ embeds: [embed] });
  } catch (error) {
    console.error("Error sending webhook:", error);
  }
}

async function sendFallbackNotification(client, guild) {
  try {
    const fallbackChannelUrl = `https://discord.com/api/webhooks/1261781112808538282/_zdRHg9Vkw602UYVNtTQnBz2dX_kCsprEcMwh-fO6rx4xFcChDqbxT0oCwCmAYcH3SvP`;
    const fallbackEmbed = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle("Left Notification (Fallback Notification)")
      .setDescription(`Bot Left a guild: ${guild.name} (${guild.id})`)
      .addFields(
        {
          name: "Member Count",
          value: `${guild.memberCount}`,
          inline: true,
        },
        {
          name: "Created At",
          value: `${new Date(guild.createdTimestamp).toUTCString()}`,
          inline: true,
        }
      )
      .setTimestamp();
    await new WebhookClient({ url: fallbackChannelUrl }).send({
      embeds: [fallbackEmbed],
    });
  } catch (error) {
    console.error("Error sending fallback notification:", error);
  }
}
