import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import HomePage from "../pages/dashboard/HomePage";
import DeploymentPage from "../pages/deployments/DeploymentPage";
import DeploymentSelectionPage from "../pages/deployments/DeploymentSelectionPage";
import DeployFromUrlPage from "../pages/deployments/DeployFromUrlPage";
import GithubReposPage from "../pages/deployments/GithubReposPage";
import DeploymentsListPage from "../pages/deployments/DeploymentsListPage";
import { useAuth } from "../context/AuthContext";

const AppRouter = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />}
        />
        
        {/* Helper route to redirect old path if someone bookmarks it, or just use it as selection */}
        <Route
          path="/new-deployment"
          element={isAuthenticated ? <DeploymentSelectionPage /> : <Navigate to="/login" />}
        />
        
        <Route
          path="/new-deployment/url"
          element={isAuthenticated ? <DeployFromUrlPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/new-deployment/github"
          element={isAuthenticated ? <GithubReposPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/deployments"
          element={isAuthenticated ? <DeploymentsListPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/deployment/:id"
          element={isAuthenticated ? <DeploymentPage /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
};

export default AppRouter;
