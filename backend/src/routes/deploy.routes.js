const express = require("express");
const router = express.Router();
const deployController = require("../controllers/deploy.controller");


router.post("/", deployController.deployPublicRepo);

router.get("/:id", deployController.getDeploymentById);

router.get("/", deployController.listDeployments);

router.delete("/:id", deployController.deleteDeployment);

module.exports = router;
