const PQueue = require("p-queue").default;

const deployQueue = new PQueue({
  concurrency: 2,   
  intervalCap: 10,  
  interval: 1000, 
});

deployQueue.on("active", () => {
  console.log(
    `[QUEUE] Running: ${deployQueue.pending} pending, ${deployQueue.size} queued`
  );
});

module.exports = deployQueue;
