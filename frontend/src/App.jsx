import React from "react";
import AppRouter from "./routes/AppRouter";
import { useAuth } from "./context/AuthContext";

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return <AppRouter />;
}

export default App;
