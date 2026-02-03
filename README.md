# DocOps

DocOps is a Platform-as-a-Service (PaaS) solution that automates the deployment lifecycle. The platform provides deployment automation, continuous delivery workflows and comprehensive application lifecycle management.

### Core Components

**Deployment Engine**: Asynchronous job queue system managing concurrent deployment workflows with priority scheduling and failure recovery mechanisms. Implements atomic deployment operations with rollback capabilities and parent-child deployment lineage tracking.

**Container Orchestration Layer**: Docker-based container runtime management with automated image building, lifecycle control, and port allocation.

**Real-Time Communication Infrastructure**: WebSocket-based bidirectional streaming for build logsa and deployment status updates. Implements Socket.IO with room-based message routing for isolated deployment channels.

**GitHub Integration Layer**: OAuth 2.0 authentication flow with repository access management and webhook-driven continuous deployment. Supports signature verification for secure webhook payload validation.


## Key Features

### Automated Deployment

Supports one-click deployments via auto-generated Dockerfiles based on user configuration. Uses RabbitMQ-backed async job queues to handle long-running tasks without blocking APIs, enabling concurrent and horizontally scalable deployments with isolated build environments.

### Continuous Delivery

GitHub webhooks trigger automatic redeployments on code pushes. The system tracks deployment history using parent-child relationships, enabling clear lineage and smooth transitions between versions.

### Rollback Support

Enables one-click rollbacks to any previous commit by rebuilding containers from deployment history, preserving a complete audit trail of changes.

### Container Management

Provides full lifecycle control over Docker containers (start, stop, delete, reconfigure), including networking, volumes, and port mappings. Failed deployments are isolated, while successful ones are registered for monitoring.

### Build Configuration

Flexible JSON-based build specs allow custom runtimes, multi-step builds, environment variables, and port settings, while remaining compatible with standard Docker workflows.

### Observability

Real-time log streaming via WebSockets for both build and runtime logs, with persistent log storage for debugging and monitoring.

## Technical Implementation

### Backend Architecture

**Node.js and Express API Server**: RESTful API endpoints with middleware pipeline for authentication, request validation, and error handling. Implements async/await patterns throughout for non-blocking I/O operations.

**Prisma ORM with SQLite**: Type-safe database access layer with automatic migration management and relation loading. Schema defines deployments, repositories, containers, and user models with foreign key relationships and cascading operations.

**RabbitMQ-Based Job Processing**: Asynchronous message queue system for non-blocking deployment operations. API endpoints immediately return 202 Accepted status and publish jobs to RabbitMQ queues, allowing long-running Docker operations to be processed by separate worker services. Features include:
- Three dedicated queues: deployment operations, container lifecycle, and GitHub webhook events
- Automatic retry mechanism (up to 3 attempts) with dead letter queues for failed jobs
- Message persistence for job recovery across service restarts
- Horizontal scaling through multiple concurrent worker instances

**Worker Services**: Separate Node.js processes consuming from RabbitMQ queues:
- **Deployment Worker** - Processes full deployment creation, redeployment, and rollback operations
- **Container Worker** - Handles container start, stop, and delete operations
- **GitHub Webhook Worker** - Processes webhook-triggered redeployments on code push

**Git Integration**: Direct git command execution through child process spawning. Implements **repository mirroring and caching** to optimize build times; repositories are cached locally to minimize network usage, updated via `git fetch`, and then cloned to isolated build workspaces. Supports both public and authenticated repository access.

**Docker Service Layer**: Abstraction over Docker CLI and API for image building, container creation, lifecycle management, and cleanup operations. Handles streaming build output to log files while emitting progress events.

**WebSocket Infrastructure**: Socket.IO server managing real-time bidirectional communication with room-based message routing. Clients subscribe to deployment-specific rooms for isolated log and status streams. Workers emit status updates for deployments, container operations, and webhook processing events.

## Technology Stack

### Backend
- Node.js with Express framework for HTTP API and middleware pipeline
- Prisma ORM for type-safe database operations and schema migrations
- RabbitMQ for asynchronous message-based job processing
- Socket.IO for WebSocket-based real-time communication
- Passport.js for GitHub OAuth authentication strategy
- amqplib for RabbitMQ protocol communication
- Docker CLI for container operations


### Frontend
- React with functional components and hooks
- Tailwind CSS for utility-first styling
- Vite for build tooling and development server
