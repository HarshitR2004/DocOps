const express = require("express");
const session = require("express-session");
const passport = require("./config/passport");

const authRoutes = require("./routes/auth.routes");

const app = express();

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


app.use(express.json());
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
