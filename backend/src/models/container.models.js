const { prisma } = require("../config/prisma.config");

const getContainerById = async (containerId) => {
  return prisma.container.findUnique({
    where: { id: containerId },
  });
};

module.exports = {
  getContainerById,
};