const { getChannel } = require("./connection");


async function consumeFromQueue(queueName, queueOptions, handler, consumerOptions = {}) {
  const channel = getChannel();

  // Set prefetch count (how many messages to process concurrently)
  const prefetch = consumerOptions.prefetch || 1;
  channel.prefetch(prefetch);

  // Assert queue exists with options
  await channel.assertQueue(queueName, queueOptions);

  console.log(`[RabbitMQ] Waiting for messages in ${queueName}. Prefetch: ${prefetch}`);

  // Start consuming
  channel.consume(
    queueName,
    async (msg) => {
      if (msg === null) {
        console.log(`[RabbitMQ] Consumer cancelled for ${queueName}`);
        return;
      }

      const content = msg.content.toString();
      const data = JSON.parse(content);

      try {
        console.log(`[RabbitMQ] Processing message from ${queueName}:`, {
          jobType: data.type,
          jobId: data.jobId,
        });

        // Execute the handler
        await handler(data, msg);

        // Acknowledge the message after successful processing
        channel.ack(msg);
        console.log(`[RabbitMQ] Message acknowledged: ${data.jobId}`);

      } catch (error) {
        console.error(`[RabbitMQ] Error processing message from ${queueName}:`, error);

        // Check retry count
        const retryCount = (msg.properties.headers?.["x-retry-count"] || 0);
        const maxRetries = consumerOptions.maxRetries || 3;

        if (retryCount < maxRetries) {
          // Retry by re-queuing with updated retry count
          console.log(`[RabbitMQ] Retrying message (attempt ${retryCount + 1}/${maxRetries})`);
          
          channel.nack(msg, false, false); 
          
          // Publish back to queue with incremented retry count
          channel.sendToQueue(
            queueName,
            msg.content,
            {
              persistent: true,
              headers: {
                ...msg.properties.headers,
                "x-retry-count": retryCount + 1,
              },
            }
          );
        } else {
          console.error(`[RabbitMQ] Max retries reached for message. Sending to DLQ.`);
          channel.nack(msg, false, false); 
        }
      }
    },
    {
      noAck: false, 
    }
  );
}

// Dead letter exchange setup
async function setupDeadLetterExchange() {
  const channel = getChannel();

  // Create dead letter exchange
  await channel.assertExchange("dlx", "direct", { durable: true });

  // Create dead letter queues for each main queue
  const deadLetterQueues = [
    "deployment_queue_dlq",
    "container_operations_queue_dlq",
    "github_webhook_queue_dlq",
  ];

  for (const dlqName of deadLetterQueues) {
    await channel.assertQueue(dlqName, { durable: true });
    await channel.bindQueue(dlqName, "dlx", dlqName);
    console.log(`[RabbitMQ] Dead letter queue set up: ${dlqName}`);
  }
}

module.exports = {
  consumeFromQueue,
  setupDeadLetterExchange,
};
