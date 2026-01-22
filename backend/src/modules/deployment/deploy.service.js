const initiateService = require("./services/initiate.service");
const processService = require("./services/process.service");
const startService = require("./services/start.service");
const stopService = require("./services/stop.service");
const deleteService = require("./services/delete.service");
const redeployService = require("./services/redeploy.service");
const configService = require("./services/config.service");
const historyService = require("./services/history.service");
const rollbackService = require("./services/rollback.service");

module.exports = {
  ...initiateService,
  ...processService,
  ...startService,
  ...stopService,
  ...deleteService,
  ...redeployService,
  ...configService,
  ...historyService,
  ...rollbackService,
};
