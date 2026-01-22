const { prisma } = require("../../../shared/config/prisma.config");
const dockerService = require("../../../shared/infrastructure/docker/docker.service");
const { getRuntimeLogStream } = require("../../../shared/utils/logWriter");


module.exports = (io) => {
  io.on("connection", (socket) => {
    // Runtime logs subscription (legacy/direct stream)
    socket.on("subscribe-logs", async ({ deploymentId }) => {
      const deployment = await prisma.deployment.findUnique({
        where: { id: deploymentId },
      });

      if (!deployment || !deployment.containerId) {
        socket.emit("logs", "No running container for this deployment\n");
        return;
      }

      const runtimeLogStream = getRuntimeLogStream(deploymentId);

      dockerService.streamContainerLogs(
        deployment.containerId,
        {
          logStream: runtimeLogStream,
          onLog: (log) => {
            socket.emit("logs", log);
          },
        }
      );
    });

    // Build logs subscription
    socket.on("subscribe-build-logs", ({ deploymentId }) => {
      socket.join(`build-${deploymentId}`);
    });

    // Runtime logs room subscription
    socket.on("subscribe-runtime-logs", ({ deploymentId }) => {
      socket.join(`runtime-${deploymentId}`);
    });

    // General Deployment Status Subscription
    socket.on("subscribe-deployment-status", ({ deploymentId }) => {
        socket.join(`deployment-${deploymentId}`);
    });

    socket.on("disconnect", () => {    });
  });
};


