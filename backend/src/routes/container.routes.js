const express = require("express");
const router = express.Router();
const containerController = require("../controllers/container.controller");

router.post("/start", containerController.startContainer);

router.post("/stop", containerController.stopContainer);

router.delete("/:id", containerController.deleteContainer);

module.exports = router;
