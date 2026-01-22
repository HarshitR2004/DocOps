const express = require("express");
const router = express.Router();

const gitHubController = require("./github.controller");

router.get("/repos", gitHubController.getGithubRepos);
router.post("/webhook", gitHubController.handleGithubWebhook);

module.exports = router;