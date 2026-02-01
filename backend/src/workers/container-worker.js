const { connectRabbitMQ, closeConnection } = require("../shared/infrastructure/rabbitmq/connection");
const { consumeFromQueue, setupDeadLetterExchange } = require("../shared/infrastructure/rabbitmq/consumer");
const { QUEUES, JOB_TYPES, CONSUMER_OPTIONS } = require("../shared/infrastructure/rabbitmq/queues.config");
const { prisma } = require("../shared/config/prisma.config");
const deployService = require("../modules/deployment/deploy.service");
const ioManager = require("../shared/infrastructure/sockets/io");
const { Server } = require("socket.io");

/**
 * Handler for container operations jobs
 */
async function handleContainerJob(data, msg) {
  const { type, jobId, deploymentId } = data;

  console.log(`[Container Worker] Processing job ${jobId} of type ${type}`);

  try {
    // Verify deployment exists
    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId },
      include: { 
        container: true,
      },
    });

    if (!deployment) {
      throw new Error(`Deployment ${deploymentId} not found`);
    }

    let result;

    // Process based on job type
    switch (type) {
      case JOB_TYPES.CONTAINER_OPERATIONS.START:
        result = await deployService.startDeployment(deploymentId);
        console.log(`[Container Worker] Started deployment ${deploymentId}`);
        break;

      case JOB_TYPES.CONTAINER_OPERATIONS.STOP:
        result = await deployService.stopDeployment(deploymentId);
        console.log(`[Container Worker] Stopped deployment ${deploymentId}`);
        break;

      case JOB_TYPES.CONTAINER_OPERATIONS.DELETE:
        result = await deployService.deleteDeployment(deploymentId);
        console.log(`[Container Worker] Deleted deployment ${deploymentId}`);
        break;

      default:
        throw new Error(`Unknown job type: ${type}`);
    }

    // Emit success via Socket.IO
    const io = ioManager.getIO();
    if (io) {
      io.emit("container:operation", {
        deploymentId,
        operation: type,
        status: "success",
        result,
      });
    }

  } catch (error) {
    console.error(`[Container Worker] Error processing job ${jobId}:`, error);
    
    // Emit failure via Socket.IO
    const io = ioManager.getIO();
    if (io) {
      io.emit("container:operation", {
        deploymentId,
        operation: type,
        status: "failed",
        error: error.message,
      });
    }

    // Re-throw to trigger retry mechanism
    throw error;
  }
}

/**
 * Initialize and start the container operations worker
 */
async function startWorker() {
  try {
    console.log("[Container Worker] Starting...");

    // Connect to RabbitMQ
    await connectRabbitMQ();
    await setupDeadLetterExchange();

    // Initialize Socket.IO for real-time updates
    const io = new Server({
      cors: {
        origin: "*",
      }
    });
    ioManager.init(io);

    console.log("[Container Worker] RabbitMQ connected");

    // Start consuming from container operations queue
    await consumeFromQueue(
      QUEUES.CONTAINER_OPERATIONS.name,
      QUEUES.CONTAINER_OPERATIONS.options,
      handleContainerJob,
      {
        prefetch: CONSUMER_OPTIONS.prefetch,
        maxRetries: 3,
      }
    );

    console.log("[Container Worker] Started successfully. Waiting for jobs...");

  } catch (error) {
    console.error("[Container Worker] Failed to start:", error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
async function gracefulShutdown(signal) {
  console.log(`\n[Container Worker] ${signal} received. Shutting down gracefully...`);
  
  // Close RabbitMQ connection
  await closeConnection();
  
  console.log("[Container Worker] Shutdown completed");
  process.exit(0);
}

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("[Container Worker] Uncaught exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[Container Worker] Unhandled rejection at:", promise, "reason:", reason);
  gracefulShutdown("UNHANDLED_REJECTION");
});

// Start the worker
startWorker();
