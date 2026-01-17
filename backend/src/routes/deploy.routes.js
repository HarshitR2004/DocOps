const express = require("express");
const router = express.Router();
const deployController = require("../controllers/deploy.controller");


router.post("/", deployController.deployPublicRepo);

router.get("/:id", deployController.getDeploymentById);

router.get("/", deployController.listDeployments);

module.exports = router;
