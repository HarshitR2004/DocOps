const http = require("http");
const app = require("./app");
const { Server } = require("socket.io");
const initLogSockets = require("./modules/deployment/sockets/logs.socket");
const ioManager = require("./shared/infrastructure/sockets/io");
const { connectRabbitMQ, closeConnection } = require("./shared/infrastructure/rabbitmq/connection");
const { setupDeadLetterExchange } = require("./shared/infrastructure/rabbitmq/consumer");

const PORT = 8080;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
  }
});

ioManager.init(io);

initLogSockets(io);

// Initialize RabbitMQ connection
async function startServer() {
  try {
    // Connect to RabbitMQ
    await connectRabbitMQ();
    await setupDeadLetterExchange();
    
    console.log("[Server] RabbitMQ initialized successfully");
    
    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`[Server] API server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("[Server] Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown(signal) {
  console.log(`\n[Server] ${signal} received. Starting graceful shutdown...`);
  
  // Close HTTP server
  server.close(async () => {
    console.log("[Server] HTTP server closed");
    
    // Close RabbitMQ connection
    await closeConnection();
    
    console.log("[Server] Graceful shutdown completed");
    process.exit(0);
  });
  
  // Force exit after 10 seconds
  setTimeout(() => {
    console.error("[Server] Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
}

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start the server
startServer();


