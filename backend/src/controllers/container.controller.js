const containerService = require("../services/container.service");

exports.startContainer = async (req, res) => {
  const { containerId } = req.body;

  if (!containerId) {
    return res.status(400).json({ error: "containerId is required" });
  }

  try {
    const container = await containerService.startContainer({ containerId });
    res.status(200).json({
      message: "Container started",
      container,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.stopContainer = async (req, res) => {
  const { containerId } = req.body;

  if (!containerId) {
    return res.status(400).json({ error: "containerId is required" });
  }

  try {
    const container = await containerService.stopContainer({ containerId });
    res.status(200).json({
      message: "Container stopped",
      container,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteContainer = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "containerId is required" });
  }

  try {
    await containerService.deleteContainer({ containerId: id });
    res.status(200).json({ message: "Container deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
