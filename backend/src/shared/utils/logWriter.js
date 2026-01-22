const fs = require("fs");
const path = require("path");


function getLogStream(deploymentId, type) {
  let baseDir = process.env.BASE_LOG_DIR || "";
  baseDir = baseDir.replace(/^"|"$/g, '');
  
  const dir = path.join(baseDir, deploymentId);

  fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${type}.log`);

  return fs.createWriteStream(filePath, {
    flags: "a",
  });
}

module.exports = {
  getBuildLogStream: (deploymentId) =>
    getLogStream(deploymentId, "build"),

  getRuntimeLogStream: (deploymentId) =>
    getLogStream(deploymentId, "runtime"),
};
