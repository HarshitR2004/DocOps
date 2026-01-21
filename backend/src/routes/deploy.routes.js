const express = require("express");
const router = express.Router();
const deployController = require("../controllers/deploy.controller");


const validateBuildSpec = require("../middleware/validateBuildspec");

router.post("/", validateBuildSpec, deployController.deployPublicRepo);
router.get("/:id", deployController.getDeploymentById);
router.put("/:id", validateBuildSpec, deployController.redeployDeployment);
router.get("/:id/config", deployController.getDeploymentConfig);

router.get("/", deployController.listDeployments);

router.delete("/:id", deployController.deleteDeployment);
router.post("/:id/start", deployController.startDeployment);
router.post("/:id/stop", deployController.stopDeployment);

module.exports = router;
