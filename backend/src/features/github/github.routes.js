const express = require("express");
const router = express.Router();

const gitHubController = require("./github.controller");

router.get("/repos", gitHubController.getGithubRepos);
router.post('webhooks/github', gitHubController.handleGithubWebhook);

module.exports = router;