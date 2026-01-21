const validateBuildSpec = (req, res, next) => {
    const { buildSpec } = req.body;

    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        
        if (req.method === 'POST' && !buildSpec) {
            return res.status(400).json({ error: "buildSpec is required" });
        }

        if (buildSpec) {
            if (!buildSpec.exposedPort) {
                return res.status(400).json({ error: "buildSpec with exposedPort is required" });
            }
        }
    }

    next();
};

module.exports = validateBuildSpec;
