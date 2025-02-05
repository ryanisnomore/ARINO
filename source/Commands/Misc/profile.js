const axios = require("axios");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

class Badges {
  constructor() {
    this.manager = "1110478596654514238";
    this.admin = "1256879367401898066";
    this.mod = "1256880503194128395";
    this.friend = "1256880229956456508";
    this.vip = "1256880111387414610";
    this.staff = "1256879720038006795";
    this.owner = "1092123729686974628";
    this.gfx = "1256879833519095849";
    this.sup = "1256879980869193768";
    this.beta = "1255190686081486959";
    this.bug = "1256880324932145224";
    this.user = "1092123729477242967";
  }
}

const badge = new Badges();

module.exports = {
  name: "profile",
  aliases: ["pr"],
  category: "Misc",
  permission: "",
  desc: "Displays the profile of a user with their badges",
  dev: false,
  options: {
    owner: false,
    inVc: false,
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
      // Constants for support guild and bot token
      const SUPPORT_GUILD_ID = "1092123729401745510"; // Replace with your support guild ID
      const SUPPORT_LINK = "https://discord.gg/W2GheK3F9m"; // Replace with your support link
      const BOT_TOKEN =
        "MTMyMTU5NTE3NDA1NjM2MjExMQ.GQlb5k.kpn6E6hq8idJi9nDC5c2J5JW2dazfLD0-lZpLw"; // Replace with your bot token
      const EMBED_COLOR = "#2f3136"; // Replace with your desired embed color
      const SUPPORT_EMOJI = "<:icon_support:1258372389612290088>"; // Replace with your desired emoji for the support button

      // Fetch the user for the profile
      const user =
        message.mentions.users.first() ||
        (args[0] ? await client.users.fetch(args[0]).catch(() => null) : message.author);

      if (!user) {
        return message.reply({
          content: "Please mention a valid user or provide a valid user ID.",
        });
      }

      // Fetch the support guild
      const guild = client.guilds.cache.get(SUPPORT_GUILD_ID) || (await client.guilds.fetch(SUPPORT_GUILD_ID).catch(() => null));
      if (!guild) {
        return message.reply({
          content: "Support guild not found. Please make sure the bot is in the support server.",
        });
      }

      // Fetch member data for the user in the support guild
      const memberData = await axios({
        url: `https://discord.com/api/v10/guilds/${guild.id}/members/${user.id}`,
        method: "GET",
        headers: {
          Authorization: `Bot ${BOT_TOKEN}`,
        },
      }).catch(() => null);

      let badges = "";

      if (!memberData || !memberData.data) {
        badges = `Join **[Support Server](${SUPPORT_LINK})** to get some badges on your profile!`;
      } else {
        const userRoles = memberData.data.roles;

        const rolesMap = [
          { role: badge.manager, text: "<:dev:1333097305313775729> **Manager**" },
          { role: badge.admin, text: "<:admin:1333098619074642021> **Admin**" },
          { role: badge.mod, text: "<:mod:1333097829354442762> **Moderator**" },
          { role: badge.friend, text: "<:special:1333098220175233044> **Friend**" },
          { role: badge.vip, text: "<:hvnvip:1272348030661689425> **Vip**" },
          { role: badge.staff, text: "<a:astaff:1333101991072890950> **Staff**" },
          { role: badge.owner, text: "<:crown:1306341065204432958> **Owner**" },
          { role: badge.gfx, text: "<:gfx:1333099063868133465> **Graphic Desiner**" },
          { role: badge.sup, text: "<:supp:1333097493298286624> **Supporter**" },
          { role: badge.beta, text: "<:DaisyPlus:1270928100657467442> **Beta Tester**" },
          { role: badge.bug, text: "<:bug:1333098616126050344> **Bug Hunter**" },
          { role: badge.user, text: "<:arino:1332999552134942801> **Arino User**" },
        ];

        rolesMap.forEach(({ role, text }) => {
          if (userRoles.includes(role)) badges += `\n${text}`;
        });

        if (!badges) {
          badges = `Join **[Support Server](${SUPPORT_LINK})** to get some badges on your profile!`;
        }
      }

      // Create the embed
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setAuthor({ name: `${user.username}'s Profile`, iconURL: user.displayAvatarURL() })
        .setDescription(`__**Achievements**__\n${badges}`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

      // Add a support button
      const supportButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Support")
          .setStyle(ButtonStyle.Link)
          .setURL(SUPPORT_LINK)
          .setEmoji(SUPPORT_EMOJI)
      );

      return message.reply({ embeds: [embed], components: [supportButton] });
    } catch (error) {
      console.error("Error in profile command:", error);
      return message.reply({
        content: "An error occurred while fetching the profile. Please try again later.",
      });
    }
  },
};
