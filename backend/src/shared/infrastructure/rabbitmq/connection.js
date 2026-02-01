const amqp = require("amqplib");

let connection;
let channel;

async function connectRabbitMQ() {
  try {
    const rabbitmqUrl = process.env.RABBITMQ_URL || "amqp://localhost";
    console.log(`[RabbitMQ] Connecting to ${rabbitmqUrl}...`);
    
    connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();
    
    console.log("[RabbitMQ] Connection established successfully");
    
    // Handle connection errors
    connection.on("error", (err) => {
      console.error("[RabbitMQ] Connection error:", err);
    });
    
    connection.on("close", () => {
      console.log("[RabbitMQ] Connection closed");
    });
    
    return channel;
  } catch (error) {
    console.error("[RabbitMQ] Failed to connect:", error);
    throw error;
  }
}

function getChannel() {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized. Call connectRabbitMQ() first.");
  }
  return channel;
}

async function closeConnection() {
  try {
    if (channel) {
      await channel.close();
      console.log("[RabbitMQ] Channel closed");
    }
    if (connection) {
      await connection.close();
      console.log("[RabbitMQ] Connection closed");
    }
  } catch (error) {
    console.error("[RabbitMQ] Error closing connection:", error);
  }
}

module.exports = {
  connectRabbitMQ,
  getChannel,
  closeConnection,
};
