const fs = require("fs");
const path = require("path");

module.exports = async (repoPath, buildSpec) => {
  const dockerfile = path.join(repoPath, "Dockerfile");
  if (fs.existsSync(dockerfile)) return;

  const { runtimeImage, buildCommand, startCommand, exposedPort } = buildSpec;

  const fileContent = `FROM ${runtimeImage}
WORKDIR /app
COPY . .
RUN ${buildCommand}
EXPOSE ${exposedPort}
CMD ${startCommand}
`;

  fs.writeFileSync(dockerfile, fileContent);
};
