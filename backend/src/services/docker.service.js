const { spawn } = require("child_process");

exports.streamContainerLogs = (containerId, onLog) => {
  const logProcess = spawn("docker", [
    "logs",
    "-f",
    containerId,
  ]);

  logProcess.stdout.on("data", (data) => {
    onLog(data.toString());
  });

  logProcess.stderr.on("data", (data) => {
    onLog(data.toString());
  });

  logProcess.on("close", () => {
    onLog("\n[container stopped]\n");
  });

  return logProcess;
};
