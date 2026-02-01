const { getChannel } = require("./connection");
const { QUEUES } = require("./queues.config");

/**
 * Generic function to publish messages to any queue
 * @param {string} queueName - Name of the queue
 * @param {Object} queueOptions - Queue options
 * @param {Object} data - Data to send (will be JSON stringified)
 */
async function publishToQueue(queueName, queueOptions, data) {
  try {
    const channel = getChannel();

    await channel.assertQueue(queueName, queueOptions);

    const sent = channel.sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(data)),
      { 
        persistent: true,
        headers: {
          "x-retry-count": 0,
        },
      }
    );

    if (sent) {
      console.log(`[RabbitMQ] Published message to ${queueName}:`, {
        jobType: data.type,
        jobId: data.jobId,
      });
    } else {
      console.warn(`[RabbitMQ] Failed to publish message to ${queueName} (buffer full)`);
    }

    return sent;
  } catch (error) {
    console.error(`[RabbitMQ] Error publishing to ${queueName}:`, error);
    throw error;
  }
}

/**
 * Publish to deployment queue
 */
async function publishDeploymentJob(data) {
  return publishToQueue(QUEUES.DEPLOYMENT.name, QUEUES.DEPLOYMENT.options, data);
}

/**
 * Publish to container operations queue
 */
async function publishContainerJob(data) {
  return publishToQueue(QUEUES.CONTAINER_OPERATIONS.name, QUEUES.CONTAINER_OPERATIONS.options, data);
}

/**
 * Publish to GitHub webhook queue
 */
async function publishGitHubWebhookJob(data) {
  return publishToQueue(QUEUES.GITHUB_WEBHOOK.name, QUEUES.GITHUB_WEBHOOK.options, data);
}

module.exports = {
  publishToQueue,
  publishDeploymentJob,
  publishContainerJob,
  publishGitHubWebhookJob,
};
