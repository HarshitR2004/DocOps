const express = require("express");
const session = require("express-session");
const passport = require("./shared/config/passport");

const authRoutes = require("./modules/auth/auth.routes");
const deployRoutes = require("./modules/deployment/deploy.routes");
const githubRoutes = require("./modules/github/github.routes");

const app = express();

BigInt.prototype.toJSON = function () {
  return this.toString()
}

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});


app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));


app.use(
  session({
    secret: "dev-secret",
    resave: false,
    saveUninitialized: false,
  })
);


app.use(passport.initialize());
app.use(passport.session());


app.use("/auth", authRoutes);
app.use("/deploy", deployRoutes);
app.use("/github", githubRoutes);

// Static Logs
let baseLogDir = process.env.BASE_LOG_DIR || "logs";
baseLogDir = baseLogDir.replace(/^"|"$/g, '');
app.use("/logs", express.static(baseLogDir));

app.get("/auth/user", (req, res) => {
  if (req.user) {
    return res.json({ isAuthenticated: true, user: req.user });
  }
  return res.status(401).json({ isAuthenticated: false });
});

app.get("/", (req, res) => {
  res.send("Healthy");
});


app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Something went wrong");
});

module.exports = app;
