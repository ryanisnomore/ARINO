const { Connectors } = require("shoukaku");
const { Kazagumo, Plugins } = require("kazagumo");
const SiaQueue = require("./kazagumoQueue");
const AvonServer = require("./AvonServer");

module.exports = class SiaKaju extends Kazagumo {
  constructor(client, nodes) {
    super(
      {
        plugins: [
          new Plugins.PlayerMoved(client),
        ],
        defaultSearchEngine: "youtube",
        defaultYoutubeThumbnail: "hq720",
        send: (guildId, payload) => {
          const guild = client.guilds.cache.get(guildId);
          if (guild) guild.shard.send(payload);
        },
      },
      new Connectors.DiscordJS(client),
      nodes,
      {
        resume: true,
        resumeTimeout: 60,
        resumeByLibrary: true,
        reconnectTries: 10,
        reconnectInterval: 10,
        restTimeout: 60,
        moveOnDisconnect: true,
        voiceConnectionTimeout: 90,
      }
    );

    // Initialize the queue and server
    this.queue = new SiaQueue(this);
    this.avonServer = new fastify();

    // Attach to events for Shoukaku's lifecycle
    this.shoukaku.on("ready", (name) =>
      console.info(`Lavalink ${name}: Ready From ARINO`)
    );

    this.shoukaku.on("disconnect", (name, count) => {
      const players = [...this.shoukaku.players.values()].filter(
        (p) => p.node.name === name
      );
      players.forEach((player) => {
        this.destroyPlayer(player.guildId);
        player.destroy();
      });
      console.warn(`Lavalink ${name}: Disconnected`);
    });

    this.shoukaku.on("close", (name, code, reason) =>
      console.warn(`Lavalink ${name}: Closed - ${code} - ${reason}`)
    );

    // Ensure `this.manager` is properly set
    this.manager = this.shoukaku;
  }
};
