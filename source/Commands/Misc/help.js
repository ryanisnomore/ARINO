const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  name: "help",
  aliases: ["h"],
  category: "Misc",
  permission: "",
  desc: "Displays all available commands or details for a specific category",
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
  run: async ({ client, message, args, guildData }) => {
    try {
      // Handle command search
      if (args.length > 0) {
        const query = args[0].toLowerCase();
        const command = client.commands.find(cmd => 
          cmd.name.toLowerCase() === query || 
          (cmd.aliases && cmd.aliases.some(alias => alias.toLowerCase() === query))
        );

        if (!command) {
          return message.reply({ 
            content: `No command found for \`${query}\``,
            allowedMentions: { repliedUser: false }
          });
        }

        const commandEmbed = new EmbedBuilder()
          .setColor(client.config.color)
          .setTitle(`Command: ${command.name}`)
          .addFields(
            { name: "Description", value: command.desc || "No description available" },
            { name: "Category", value: command.category || "Misc", inline: true },
            { name: "Aliases", value: command.aliases?.join(", ") || "None", inline: true },
            { name: "Usage", value: `\`${guildData.prefix}${command.name}${command.options?.player?.playing ? " [song]" : ""}\``, inline: true }
          )
          .setFooter({ text: `Requested by ${message.author.tag}` });

        return message.reply({ 
          embeds: [commandEmbed],
          allowedMentions: { repliedUser: false }
        });
      }

      // Original category menu code
      const categories = ["Misc", "Music", "Settings", "Filters", "Playlist"];
      
      const categoryEmojis = {
        Misc: "<:misc:1301837560758276107>",
        Music: "<:music_avon:1064924736833986642>",
        Settings: "<:settings_avon:1066317766312874004>",
        Filters: "<:Avon_Filters:1130897583242485891>",
        Playlist: "<:playlistmusic:1324661627798425622>",
      };

      const getCommandsByCategory = (category) => {
        return client.commands.filter((cmd) => cmd.category === category);
      };

      const formatCommands = (commands) => {
        return commands.map((cmd) => `\`${cmd.name}\``).join(', ');
      };

      const MainEmbed = () =>
        new EmbedBuilder()
          .setColor(client.config.color)
          .setAuthor({
            name: `${client.user.username} Help Menu`,
            iconURL: client.user.displayAvatarURL({ dynamic: true }),
          })
          .setDescription(
            `<:Musica:1306332371565678606> Assalamu-Alaikum <@${message.author.id}> Welcome to the Arino Help Desk!\n\n` +
            `<:narrow:1268395564224090122> Select a category from the menu below\n` +
            `<:narrow:1268395564224090122> Use \`${guildData.prefix}help <query>\` to search commands`
          )
          .addFields({
            name: "Command Stats",
            value: `Total Commands: ${client.commands.size}`,
            inline: true
          })
          .setFooter({ text: `Requested by ${message.author.tag}` })
          .setThumbnail(client.user.displayAvatarURL({ dynamic: true }));

      const createCategoryMenu = () =>
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("help_menu")
            .setPlaceholder("Select A Category")
            .addOptions(
              categories.map((category) => ({
                label: category,
                value: category.toLowerCase(),
                emoji: categoryEmojis[category] || "⚙️"
              }))
            )
        );

      const helpMessage = await message.channel.send({
        embeds: [MainEmbed()],
        components: [createCategoryMenu()],
      });

      const collector = helpMessage.createMessageComponentCollector({
        time: 300000,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.user.id !== message.author.id) {
          return interaction.reply({
            content: "This help menu is for the command author only!",
            ephemeral: true,
          });
        }

        if (interaction.isStringSelectMenu()) {
          const selectedCategory = categories.find(
            cat => cat.toLowerCase() === interaction.values[0]
          );

          if (selectedCategory) {
            const commands = getCommandsByCategory(selectedCategory);
            const formattedCommands = formatCommands(commands);

            const categoryEmbed = new EmbedBuilder()
              .setColor(client.config.color)
              .setTitle(`${selectedCategory} Commands`)
              .setDescription(formattedCommands)
              .setFooter({ 
                text: `${commands.size} commands • ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL() 
              });

            const backButton = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("help_back")
                .setEmoji("1267775359747887124")
                .setStyle(ButtonStyle.Primary)
            );

            await interaction.update({
              embeds: [categoryEmbed],
              components: [backButton]
            });
          }
        }

        if (interaction.isButton() && interaction.customId === "help_back") {
          await interaction.update({
            embeds: [MainEmbed()],
            components: [createCategoryMenu()]
          });
        }
      });

      collector.on("end", () => {
        helpMessage.edit({ components: [] }).catch(() => {});
      });

    } catch (error) {
      console.error("Error in help command:", error);
      message.channel.send("An error occurred while displaying the help menu.");
    }
  },
};
