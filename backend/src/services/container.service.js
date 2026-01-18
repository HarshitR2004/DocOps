const { prisma } = require("../config/prisma.config");
const { exec } = require("child_process");
const {getContainerById} = require("../models/container.models")


exports.stopContainer = async ({ containerId }) => {
  const container = await getContainerById(containerId);
  if (!container) {
    throw new Error("Container not found");
  }

  await run(`docker stop ${container.dockerContainerId}`);

  return prisma.container.update({
    where: { id: containerId },
    data: {
      status: "STOPPED",
      stoppedAt: new Date(),
    },
  });
};

exports.startContainer = async ({ containerId }) => {
  const container = await getContainerById(containerId);
  if (!container) {
    throw new Error("Container not found");
  }

  await run(`docker start ${container.dockerContainerId}`);

  return prisma.container.update({
    where: { id: containerId },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
      stoppedAt: null,
    },
  });
};

exports.deleteContainer = async ({ containerId }) => {
  const container = await getContainerById(containerId);
  if (!container) {
    throw new Error("Container not found");
  }

  await run(`docker rm -f ${container.dockerContainerId}`);

  return prisma.container.delete({
    where: { id: containerId },
  });
};



function run(cmd, cwd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd }, (err, stdout, stderr) => {
      if (err) reject(stderr || err.message);
      else resolve(stdout);
    });
  });
}