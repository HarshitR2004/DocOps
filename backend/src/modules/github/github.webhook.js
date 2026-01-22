const axios = require("axios");

exports.createWebhook = async ({ token, repoFullName, webhookUrl }) => {
  const res = await axios.post(
    `https://api.github.com/repos/${repoFullName}/hooks`,
    {
      name: "web",
      active: true,
      events: ["push"],
      config: {
        url: webhookUrl,
        content_type: "json",
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  return res.data.id;
};
