const { spawn } = require("child_process");

exports.streamContainerLogs = (
  containerId, 
  {onLog, logStream}
) => {
  const logProcess = spawn("docker", [
    "logs",
    "-f",
    containerId,
  ]);

  logProcess.stdout.on("data", (data) => {
    logStream.write(data.toString());
    onLog(data.toString()); 
  });

  logProcess.stderr.on("data", (data) => {
    logStream.write(data.toString());
    onLog(data.toString());
  });

  logProcess.on("close", () => {
    logStream.end();
    onLog("\n[container stopped]\n");
  });

  return logProcess;
};

exports.buildImage = ({ imageTag, contextDir, onLog, logStream }) => {
  return new Promise((resolve, reject) => {
    const buildProcess = spawn(
      "docker",
      ["build", "-t", imageTag, "."],
      { cwd: contextDir }
    );


    buildProcess.stdout.on("data", (data) => {
      logStream.write(data.toString());
      onLog(data.toString());
    });

    buildProcess.stderr.on("data", (data) => {
      logStream.write(data.toString());
      onLog(data.toString());
    });

    buildProcess.on("close", (code) => {
      logStream.end();
      if (code === 0) resolve();
      else reject(new Error(`Build failed with code ${code}`));
    });
  });
};
