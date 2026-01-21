import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:8080";

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (this.socket) return;
    
    this.socket = io(SOCKET_URL);

    this.socket.on("connect", () => {
      console.log("Connected to WebSocket");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
    });
  }

  subscribeToLogs(deploymentId, callback) {
    if (!this.socket) this.connect();
    
    // Subscribe to specific deployment logs
    this.socket.emit("subscribe-logs", { deploymentId });
    
    // Listen for logs
    this.socket.on("logs", (logData) => {
      callback(logData);
    });
  }

  subscribeToBuildLogs(deploymentId, callback) {
    if (!this.socket) this.connect();

    this.socket.emit("subscribe-build-logs", { deploymentId });

    this.socket.on("build-logs", (logData) => {
      callback(logData);
    });
  }

  subscribeToStatus(deploymentId, callback) {
    if (!this.socket) this.connect();

    this.socket.emit("subscribe-deployment-status", { deploymentId });

    this.socket.on("deployment-status", (statusData) => {
        callback(statusData);
    });
  }

  unsubscribeFromLogs() {
    if (this.socket) {
      this.socket.off("logs");
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
