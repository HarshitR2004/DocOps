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
import NewDeploymentPage from "../pages/NewDeploymentPage";
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
        <Route
          path="/new-deployment"
          element={isAuthenticated ? <NewDeploymentPage /> : <Navigate to="/login" />}
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
