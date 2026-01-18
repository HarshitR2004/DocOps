const { prisma } = require("../config/prisma.config");
const dockerService = require("../services/docker.service");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

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

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};
