const { EmbedBuilder } = require("discord.js");
const Nodeactyl = require("nodeactyl");
const ms = require("ms");

module.exports = {
  name: "panel",
  aliases: ["vps", "pnl"],
  category: "",
  dev: true,
  options: {
    owner: true,
    inVc: false,
    sameVc: false,
    player: {
      playing: false,
      active: false,
    },
    premium: false,
    vote: false,
  },

  run: async ({ client, message }) => {
    try {
      // Initial embed
      let emb = new EmbedBuilder()
        .setDescription(`<a:DaisyLoading:1271046875541278791> **Getting data. Please wait. . .**`)
        .setColor(client.config.color);

      let reply = await message.reply({ embeds: [emb] });

      const credentials = [
        {
          uri: "",
          key: "",
          id: "",
        },
      ];

      let descriptions = async () => {
        let data = [];

        for (let i = 0; i < credentials.length; i++) {
          const entry = credentials[i];
          try {
            let panel = new Nodeactyl.NodeactylClient(entry.uri, entry.key);
            let id = entry.id;

            let usages = await panel.getServerUsages(id);
            let details = await panel.getServerDetails(id);

            data.push(
              `\`\`\`js\n` +
                `"Node/ARINO Panel Stats" \n\n` +
                `[\n` +
                `  ${details.name} { \n` +
                `    Node: '${details.node}',\n` +
                `    Uptime: '${ms(usages.resources.uptime)}',\n` +
                `    Docker: '${details.docker_image.split(":")[1]}',\n` +
                `    State: '${usages.current_state}',\n` +
                `    CPU: ${usages.resources.cpu_absolute}/${details.limits.cpu} %vCPU,\n` +
                `    RAM: ${(usages.resources.memory_bytes / 1048576).toFixed(
                  3
                )}/${details.limits.memory} MiB,\n` +
                `    Disk: ${(usages.resources.disk_bytes / 1048576).toFixed(
                  3
                )}/${details.limits.disk} MiB,\n` +
                `    Network_Tx: ${(
                  usages.resources.network_tx_bytes / 1048576
                ).toFixed(3)} MiB,\n` +
                `    Network_Rx: ${(
                  usages.resources.network_rx_bytes / 1048576
                ).toFixed(3)} MiB,\n` +
                `  },\n` +
                `]\`\`\``
            );
          } catch (e) {
            console.error(`Error fetching panel data for ${entry.uri}:`, e);
            data.push(`\`\`\`js\n${entry.uri}\n\n${e.message || e}\`\`\``);
          }
        }
        return data;
      };

      const descs = await descriptions();
      const embeds = descs.map(
        (desc) => new EmbedBuilder().setDescription(desc).setColor(client.config.color)
      );

      if (embeds.length > 0) {
        for (const embed of embeds) {
          await message.channel.send({ embeds: [embed] });
        }
      } else {
        await message.channel.send("No data available.");
      }

      return reply.delete().catch(() => {});
    } catch (error) {
      console.error("Error executing panel command:", error);
      await message.reply("An error occurred while fetching panel data.");
    }
  },
};
