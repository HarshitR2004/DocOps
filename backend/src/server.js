const http = require("http");
const app = require("./app");
const { Server } = require("socket.io");
const initLogSockets = require("./sockets/logs.socket");

const PORT = 8080;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
  }
});

initLogSockets(io);

server.listen(PORT, () => {
  console.log(`DocOps Backend running on port ${PORT}`);
});
