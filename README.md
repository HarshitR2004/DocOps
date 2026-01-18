# DocOps

DocOps is a modern, self-hosted Platform-as-a-Service (PaaS) that simplifies the deployment of web applications directly from GitHub. Built with a focus on developer experience, it automates the Dockerization and orchestration of your projects.

## Features

-   **One-Click Deployment**: Deploy any GitHub repository.
-   **Automated Builds**: Automatically detects project types, generates Dockerfiles, and builds Docker images.
-   **Real-Time Monitoring**: Stream build logs and application runtime logs in real-time.
-   **Persistent Logging**: Access historical build and runtime logs for all your deployments.
-   **Lifecycle Management**: Start, stop, and delete deployments with ease.


## Tech Stack

-   **Frontend**: React
-   **Backend**: Node.js, Express.js, Socket.IO
-   **Database**: SQLite with Prisma ORM

## Prerequisites

-   Node.js (v18+)
-   Docker (Running and accessible)
-   Git

## Getting Started

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd DocOps
    ```

2.  **Setup Backend**
    ```bash
    cd backend
    npm install
    npx prisma migrate dev
    # Create .env file with GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, BASE_LOG_DIR, etc.
    npm run dev
    ```

3.  **Setup Frontend**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4.  **Access the Platform**
    Open `http://localhost:5173` in your browser.


