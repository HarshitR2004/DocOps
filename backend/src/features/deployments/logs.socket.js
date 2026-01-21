const { prisma } = require("../../config/prisma.config");
const dockerService = require("./docker.service");
const { getRuntimeLogStream } = require("../../utils/logWriter");


module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

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

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};
