# DocOps

DocOps is a Platform-as-a-Service (PaaS) solution that automates the deployment lifecycle. The platform provides deployment automation, continuous delivery workflows and comprehensive application lifecycle management.

### Core Components

**Deployment Engine**: Asynchronous job queue system managing concurrent deployment workflows with priority scheduling and failure recovery mechanisms. Implements atomic deployment operations with rollback capabilities and parent-child deployment lineage tracking.

**Container Orchestration Layer**: Docker-based container runtime management with automated image building, lifecycle control, and port allocation.

**Real-Time Communication Infrastructure**: WebSocket-based bidirectional streaming for build logsa and deployment status updates. Implements Socket.IO with room-based message routing for isolated deployment channels.

**GitHub Integration Layer**: OAuth 2.0 authentication flow with repository access management and webhook-driven continuous deployment. Supports signature verification for secure webhook payload validation.

## Key Features

### Automated Deployment Pipeline

The platform provides  deployment for supported application frameworks through automated Dockerfile generation by the configuration provide by the user.

Deployment workflows are managed through an asynchronous job queue that ensures serialized execution per repository while enabling concurrent deployments across different projects. Each deployment generates isolated build environments in ephemeral directories with automatic cleanup post-deployment.

### Continuous Delivery Automation

GitHub webhook integration enables automated redeployment on code push events. The system maintains deployment lineage through parent-child relationships, allowing tracking of deployment history and rollback to previous commits. When a webhook is received, the platform identifies active deployments for the affected branch, queues child deployments with commit SHA references, and manages the transition from parent to child deployment states.

### Deployment Rollback System

Rollback functionality leverages deployment history stored in parent-child relationships to enable one-click reversion to previous application states. Users can select any historical commit from the deployment chain, triggering creation of a new child deployment that checks out the specific commit SHA and rebuilds the container at that point in history. This maintains an audit trail of all deployment changes and state transitions.

### Container Lifecycle Management

Comprehensive container control operations including start, stop, delete, and reconfigure actions. The platform manages Docker container lifecycle through direct API integration, handling port mapping, volume management, and container networking. Failed containers are automatically marked and isolated, while successful deployments register container metadata for monitoring and management operations.

### Build Specification System

Advanced build configuration through JSON-based build specs supporting custom runtime images, multi-command build steps, environment variable injection, and port exposure settings. Users can define language-specific configurations with explicit runtime specifications, and customize the entire build pipeline while maintaining compatibility with standard Dockerfile workflows.

### Real-Time Observability

Live log streaming delivers build output and runtime logs to connected clients with minimal latency through WebSocket connections. The system maintains persistent log files on disk while simultaneously streaming to connected dashboards. Build logs capture Docker image construction output, while runtime logs provide container stdout/stderr streams for debugging and monitoring.

## Technical Implementation

### Backend Architecture

**Node.js and Express API Server**: RESTful API endpoints with middleware pipeline for authentication, request validation, and error handling. Implements async/await patterns throughout for non-blocking I/O operations.

**Prisma ORM with SQLite**: Type-safe database access layer with automatic migration management and relation loading. Schema defines deployments, repositories, containers, and user models with foreign key relationships and cascading operations.

**Queue-Based Job Processing**: In-memory job queue with promise-based task execution and error recovery. Supports adding async functions that execute sequentially with automatic retry on transient failures.

**Git Integration**: Direct git command execution through child process spawning for repository cloning, branch checkout, and commit resolution. Supports both public and authenticated repository access.

**Docker Service Layer**: Abstraction over Docker CLI and API for image building, container creation, lifecycle management, and cleanup operations. Handles streaming build output to log files while emitting progress events.

**WebSocket Infrastructure**: Socket.IO server managing real-time bidirectional communication with room-based message routing. Clients subscribe to deployment-specific rooms for isolated log and status streams.

## Technology Stack

### Backend
- Node.js with Express framework for HTTP API and middleware pipeline
- Prisma ORM for type-safe database operations and schema migrations
- Socket.IO for WebSocket-based real-time communication
- Passport.js for GitHub OAuth authentication strategy
- p-queue for asynchronous job queue management


### Frontend
- React with functional components and hooks
- Tailwind CSS for utility-first styling
- Vite for build tooling and development server