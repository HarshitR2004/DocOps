const PQueue = require("p-queue").default;

const deployQueue = new PQueue({
  concurrency: 2,   
  intervalCap: 10,  
  interval: 1000, 
});

deployQueue.on("active", () => {});

module.exports = deployQueue;


