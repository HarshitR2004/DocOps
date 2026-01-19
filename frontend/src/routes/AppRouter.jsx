import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import DeploymentPage from "../pages/DeploymentPage";
import DeploymentSelectionPage from "../pages/DeploymentSelectionPage";
import DeployFromUrlPage from "../pages/DeployFromUrlPage";
import GithubReposPage from "../pages/GithubReposPage";
import DeploymentsListPage from "../pages/DeploymentsListPage";
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
