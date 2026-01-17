const { prisma } = require("../db/prisma");

const findUserByGithubId = async (githubId) => {
  return await prisma.user.findUnique({
    where: { githubId },
  });
};

const createUser = async (userData) => {
  return await prisma.user.create({
    data: userData,
  });
};

const updateUser = async (githubId, updateData) => {
  return await prisma.user.update({
    where: { githubId },
    data: updateData,
  });
};

module.exports = {
  findUserByGithubId,
  createUser,
  updateUser,
};