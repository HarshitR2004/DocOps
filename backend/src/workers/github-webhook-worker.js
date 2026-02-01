const { connectRabbitMQ, closeConnection } = require("../shared/infrastructure/rabbitmq/connection");
const { consumeFromQueue, setupDeadLetterExchange } = require("../shared/infrastructure/rabbitmq/consumer");
const { QUEUES, JOB_TYPES, CONSUMER_OPTIONS } = require("../shared/infrastructure/rabbitmq/queues.config");
const { prisma } = require("../shared/config/prisma.config");
const { redeployFromParent } = require("../modules/deployment/services/redeploy.service");
const ioManager = require("../shared/infrastructure/sockets/io");
const { Server } = require("socket.io");

/**
 * Handler for GitHub webhook jobs
 */
async function handleGitHubWebhookJob(data, msg) {
  const { type, jobId, parentDeploymentId, branch, commitSha } = data;

  console.log(`[GitHub Webhook Worker] Processing job ${jobId} of type ${type}`);

  try {
    // Process based on job type
    switch (type) {
      case JOB_TYPES.GITHUB_WEBHOOK.PUSH:
        // Redeploy from parent deployment
        await redeployFromParent(parentDeploymentId, branch);
        console.log(`[GitHub Webhook Worker] Successfully redeployed from parent ${parentDeploymentId}`);
        break;

      default:
        throw new Error(`Unknown job type: ${type}`);
    }

    // Emit success via Socket.IO
    const io = ioManager.getIO();
    if (io) {
      io.emit("webhook:processed", {
        parentDeploymentId,
        branch,
        commitSha,
        status: "success",
      });
    }

  } catch (error) {
    console.error(`[GitHub Webhook Worker] Error processing job ${jobId}:`, error);
    
    // Update parent deployment status to FAILED
    try {
      await prisma.deployment.update({
        where: { id: parentDeploymentId },
        data: { status: "FAILED" },
      });
    } catch (updateError) {
      console.error(`[GitHub Webhook Worker] Failed to update deployment status:`, updateError);
    }

    // Emit failure via Socket.IO
    const io = ioManager.getIO();
    if (io) {
      io.emit("webhook:processed", {
        parentDeploymentId,
        branch,
        commitSha,
        status: "failed",
        error: error.message,
      });
    }

    // Re-throw to trigger retry mechanism
    throw error;
  }
}

/**
 * Initialize and start the GitHub webhook worker
 */
async function startWorker() {
  try {
    console.log("[GitHub Webhook Worker] Starting...");

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

    console.log("[GitHub Webhook Worker] RabbitMQ connected");

    // Start consuming from GitHub webhook queue
    await consumeFromQueue(
      QUEUES.GITHUB_WEBHOOK.name,
      QUEUES.GITHUB_WEBHOOK.options,
      handleGitHubWebhookJob,
      {
        prefetch: CONSUMER_OPTIONS.prefetch,
        maxRetries: 3,
      }
    );

    console.log("[GitHub Webhook Worker] Started successfully. Waiting for jobs...");

  } catch (error) {
    console.error("[GitHub Webhook Worker] Failed to start:", error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
async function gracefulShutdown(signal) {
  console.log(`\n[GitHub Webhook Worker] ${signal} received. Shutting down gracefully...`);
  
  // Close RabbitMQ connection
  await closeConnection();
  
  console.log("[GitHub Webhook Worker] Shutdown completed");
  process.exit(0);
}

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("[GitHub Webhook Worker] Uncaught exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[GitHub Webhook Worker] Unhandled rejection at:", promise, "reason:", reason);
  gracefulShutdown("UNHANDLED_REJECTION");
});

// Start the worker
startWorker();
