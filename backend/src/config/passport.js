require("dotenv").config();
const GitHubStrategy = require("passport-github2").Strategy;
const passport = require("passport");
const { findUserByGithubId, createUser } = require("../models/users.models.js");
const { prisma } = require("../config/prisma.config.js");

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ["user", "repo", "read:org"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await findUserByGithubId(profile.id);

        if (!user) {
          user = await createUser({
            githubId: profile.id,
            username: profile.username,
            email: profile.emails?.[0]?.value,
            avatarUrl: profile.photos?.[0]?.value,
            githubAccessToken: accessToken,
          });
        } else {
          user = await prisma.user.update({
            where: { githubId: profile.id },
            data: {
              githubAccessToken: accessToken,
            },
          });
        }

        return done(null, user, accessToken);
      } catch (err) {
        return done(err);
      }
    }
  )
);



passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;