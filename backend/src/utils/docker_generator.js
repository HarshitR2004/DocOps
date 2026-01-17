const fs = require("fs");
const path = require("path");

module.exports = async (repoPath) => {
  const dockerfile = path.join(repoPath, "Dockerfile");
  if (fs.existsSync(dockerfile)) return;

  fs.writeFileSync(
    dockerfile,
`FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
`);
};
