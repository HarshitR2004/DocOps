const fs = require("fs");
const path = require("path");

exports.detectBuildType = (repoPath) => {
  if (fs.existsSync(path.join(repoPath, "package.json"))) {
    return "node";
  }

  if (
    fs.existsSync(path.join(repoPath, "requirements.txt")) ||
    fs.existsSync(path.join(repoPath, "pyproject.toml"))
  ) {
    return "python";
  }

  return null;
};

