const { EventEmitter } = require("events");

class LoadBalancer extends EventEmitter {
  constructor(manager) {
    super();
    this.manager = manager;
  }

  balance() {
    const clusters = Array.from(this.manager.clusters.values());
    clusters.sort((a, b) => a.stats.cpu - b.stats.cpu);
    const overloadedClusters = clusters.filter((c) => c.stats.cpu > 80);
    const underloadedClusters = clusters.filter((c) => c.stats.cpu < 20);
    for (const overloaded of overloadedClusters) {
      if (underloadedClusters.length > 0) {
        const target = underloadedClusters.shift();
        this.emit("rebalance", overloaded, target).catch((err) => {
          console.error(
            `Failed to rebalance Cluster ${overloaded.id} -> Cluster ${target.id}:`,
            err
          );
        });
      }
    }
  }
}

module.exports = { LoadBalancer };
