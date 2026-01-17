import React from "react";
import EnterRepo from "../components/auth/EnterRepo";

const HomePage = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md dark:bg-gray-800 p-6">
        <EnterRepo />
      </div>
    </div>
  );
};

export default HomePage;
