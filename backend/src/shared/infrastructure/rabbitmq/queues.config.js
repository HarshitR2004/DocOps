// Queue configuration for all RabbitMQ queues
const QUEUES = {
  DEPLOYMENT: {
    name: "deployment_queue",
    options: {
      durable: true,
      deadLetterExchange: "dlx",
      deadLetterRoutingKey: "deployment_queue_dlq",
      messageTtl: 3600000, // 1 hour
    },
  },
  CONTAINER_OPERATIONS: {
    name: "container_operations_queue",
    options: {
      durable: true,
      deadLetterExchange: "dlx",
      deadLetterRoutingKey: "container_operations_queue_dlq",
      messageTtl: 600000, // 10 minutes
    },
  },
  GITHUB_WEBHOOK: {
    name: "github_webhook_queue",
    options: {
      durable: true,
      deadLetterExchange: "dlx",
      deadLetterRoutingKey: "github_webhook_queue_dlq",
      messageTtl: 1800000, // 30 minutes
    },
  },
};

// Job types for each queue
const JOB_TYPES = {
  DEPLOYMENT: {
    CREATE: "deployment:create",
    REDEPLOY: "deployment:redeploy",
    ROLLBACK: "deployment:rollback",
  },
  CONTAINER_OPERATIONS: {
    START: "container:start",
    STOP: "container:stop",
    DELETE: "container:delete",
  },
  GITHUB_WEBHOOK: {
    PUSH: "github:push",
  },
};

// Consumer options
const CONSUMER_OPTIONS = {
  prefetch: 1, 
  noAck: false, 
};

module.exports = {
  QUEUES,
  JOB_TYPES,
  CONSUMER_OPTIONS,
};
