# DocOps

DocOps is a self-hosted Platform-as-a-Service (PaaS) that enables seamless deployment of web applications directly from GitHub repositories. It automates the entire containerization and deployment pipeline, allowing developers to focus on their code rather than infrastructure management.

## Overview

DocOps bridges the gap between your GitHub repository and a running Docker container by automating build processes, managing deployments, and providing real-time insights into application performance and logs.

## Features

### Deployment Management

- Deploy any public or private GitHub repository with a single click
- Support for multiple branches and custom port configurations
- Automatic project type detection and intelligent Dockerfile generation
- Streamlined deployment workflow from repository selection to live application

### Docker Integration

- Automated Docker image building and containerization
- Docker container lifecycle management including start, stop, and restart operations
- Full container status monitoring and health checks
- Seamless Docker registry integration

### Real-Time Monitoring and Logging

- Live build log streaming during deployment process
- Real-time application runtime log viewer
- WebSocket-based instant log updates without polling
- Historical log retention for all deployments
- Per-deployment log segregation for easy tracking

### GitHub Integration

- OAuth-based GitHub authentication
- Browse and explore available GitHub repositories
- Direct repository selection and branch management
- Access control through GitHub credentials

### Application Lifecycle Control

- Start, stop, restart, and delete deployments on demand
- Track deployment status and health metrics
- Container resource monitoring
- Deployment history and detailed deployment information

## Technology Stack

- **Frontend**: React with Vite, Tailwind CSS, Lucide React icons, Socket.IO client
- **Backend**: Node.js with Express.js, Socket.IO for real-time communication
- **Database**: SQLite with Prisma ORM
- **Authentication**: GitHub OAuth 2.0 with Passport.js
- **Containerization**: Docker engine integration
