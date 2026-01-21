
exports.githubCallback = (req, res) => {
  res.redirect("http://localhost:5173/");
};

exports.logout = (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out successfully" });
  });
};
