const { connectRabbitMQ, closeConnection } = require("../shared/infrastructure/rabbitmq/connection");
const { consumeFromQueue, setupDeadLetterExchange } = require("../shared/infrastructure/rabbitmq/consumer");
const { QUEUES, JOB_TYPES, CONSUMER_OPTIONS } = require("../shared/infrastructure/rabbitmq/queues.config");
const { prisma } = require("../shared/config/prisma.config");
const deployService = require("../modules/deployment/deploy.service");
const ioManager = require("../shared/infrastructure/sockets/io");
const { Server } = require("socket.io");

// Handler for deployment jobs
async function handleDeploymentJob(data, msg) {
  const { type, jobId, deploymentId } = data;

  console.log(`[Deployment Worker] Processing job ${jobId} of type ${type}`);

  try {
    // Fetch deployment with all relations
    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId },
      include: { 
        repository: true,
        container: true,
      },
    });

    if (!deployment) {
      throw new Error(`Deployment ${deploymentId} not found`);
    }

    // Process based on job type
    switch (type) {
      case JOB_TYPES.DEPLOYMENT.CREATE:
      case JOB_TYPES.DEPLOYMENT.REDEPLOY:
      case JOB_TYPES.DEPLOYMENT.ROLLBACK:
        
        await deployService.processDeployment(deployment);
        console.log(`[Deployment Worker] Successfully processed deployment ${deploymentId}`);
        break;

      default:
        throw new Error(`Unknown job type: ${type}`);
    }

  } catch (error) {
    console.error(`[Deployment Worker] Error processing job ${jobId}:`, error);
    
    // Update deployment status to FAILED
    try {
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: { 
          status: "FAILED",
          updatedAt: new Date(),
        },
      });

      // Emit failure via Socket.IO
      const io = ioManager.getIO();
      if (io) {
        io.emit("deployment:status", {
          deploymentId,
          status: "FAILED",
          error: error.message,
        });
      }
    } catch (updateError) {
      console.error(`[Deployment Worker] Failed to update deployment status:`, updateError);
    }

    // Re-throw to trigger retry mechanism
    throw error;
  }
}


async function startWorker() {
  try {
    console.log("[Deployment Worker] Starting...");

    // Connect to RabbitMQ
    await connectRabbitMQ();
    await setupDeadLetterExchange();


    const io = new Server({
      cors: {
        origin: "*",
      }
    });
    ioManager.init(io);

    console.log("[Deployment Worker] RabbitMQ connected");

    // Start consuming from deployment queue
    await consumeFromQueue(
      QUEUES.DEPLOYMENT.name,
      QUEUES.DEPLOYMENT.options,
      handleDeploymentJob,
      {
        prefetch: CONSUMER_OPTIONS.prefetch,
        maxRetries: 3,
      }
    );

    console.log("[Deployment Worker] Started successfully. Waiting for jobs...");

  } catch (error) {
    console.error("[Deployment Worker] Failed to start:", error);
    process.exit(1);
  }
}


async function gracefulShutdown(signal) {
  console.log(`\n[Deployment Worker] ${signal} received. Shutting down gracefully...`);
  
  await closeConnection();
  
  console.log("[Deployment Worker] Shutdown completed");
  process.exit(0);
}

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("[Deployment Worker] Uncaught exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[Deployment Worker] Unhandled rejection at:", promise, "reason:", reason);
  gracefulShutdown("UNHANDLED_REJECTION");
});

// Start the worker
startWorker();
