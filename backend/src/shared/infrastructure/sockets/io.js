let io = null;

module.exports = {
  init: (serverIo) => {
    io = serverIo;
  },
  get: () => {
    if (!io) {
      throw new Error("Socket.IO not initialized");
    }
    return io;
  },
};
