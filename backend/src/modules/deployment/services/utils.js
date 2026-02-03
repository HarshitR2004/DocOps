const { exec } = require("child_process");

function run(cmd, cwd) {
  return new Promise((resolve, reject) => {
    exec(
      cmd,
      {
        cwd,
        timeout: 7 * 60 * 1000, // 7 minutes
      },
      (err, stdout, stderr) => {
        if (err) {
          if (err.killed) {
            return reject("Command timed out after 7 minutes");
          }
          return reject(stderr || err.message);
        }
        resolve(stdout);
      }
    );
  });
}

module.exports = { run };

