import cluster from "cluster";
import path from "path";

const defaultOptions = {
  script: "server.js",
  args: []
};

export default class ReloadServerPlugin {
  constructor({ script, args } = defaultOptions) {
    this.done = null;
    this.workers = [];

    cluster.setupMaster({
      exec: path.resolve(process.cwd(), script),
      args: args 
    });

    cluster.on("online", (worker) => {
      this.workers.push(worker);

      if (this.done) {
        this.done();
      }
    });
  }

  apply(compiler) {
    compiler.plugin("after-emit", (compilation, callback) => {
      this.done = callback;
      this.workers.forEach((worker) => {
        try {
          process.kill(worker.process.pid, "SIGTERM");
        } catch (e) {
          console.warn(`Unable to kill process #${worker.process.pid}`);
        }
      });

      this.workers = [];

      cluster.fork();
    });
  }
}
