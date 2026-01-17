const express = require("express");
const passport = require("passport");
const { githubCallback, logout } = require("../controllers/auth.controller");

const router = express.Router();

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  githubCallback
);

router.get("/logout", logout);

module.exports = router;


