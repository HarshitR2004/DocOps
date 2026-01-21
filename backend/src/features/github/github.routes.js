const express = require("express");
const router = express.Router();

const gitHubController = require("./github.controller");

router.get("/repos", gitHubController.getGithubRepos);

module.exports = router;