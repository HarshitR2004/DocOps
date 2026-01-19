# DocOps

**DocOps** is a modern, self-hosted Platform-as-a-Service (PaaS) designed to streamline the deployment of web applications directly from GitHub. It abstracts away the complexity of infrastructure management, offering a developer-centric dashboard for automating containerization, deployment, and monitoring.

## Key Features


### Seamless Deployment Pipeline
*   **One-Click Deploy**: Launch any public or private GitHub repository instantly.
*   **Auto-Detection**: Intelligent analysis of your repository to auto-configure Docker builds for Node.js, Python, and more.
*   **Custom Build Specs**: Full control over build commands, runtime images, and exposed ports.

### Full Lifecycle Management
*   **Container Control**: Start, stop, and terminate applications directly from the dashboard.
*   **Hot Redeploy**: Reconfigure and redeploy applications with new settings without downtime.
*   **Health Monitoring**: Continuous status tracking with visual health indicators.

### Real-Time Observability
*   **Live Log Streaming**: Watch build processes and runtime logs stream in real-time via WebSocket.
*   **Historical Logs**: Access past build logs for debugging and auditing.

### Secure & Integrated
*   **GitHub OAuth**: Secure authentication and repository access.
*   **Private Repos**: Full support for deploying from private organizations and repositories.

## Technology Stack

*   **Frontend**: React, Tailwind CSS
*   **Backend**: Node.js, Express, Socket.IO
*   **Database**: SQLite, Prisma
*   **Infrastructure**: Docker


