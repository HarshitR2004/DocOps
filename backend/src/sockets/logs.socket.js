const { prisma } = require("../config/prisma.config");
const dockerService = require("../services/docker.service");

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

      dockerService.streamContainerLogs(
        deployment.containerId,
        (logLine) => {
          socket.emit("logs", logLine);
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

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};
