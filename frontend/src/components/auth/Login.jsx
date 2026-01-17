import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from '@headlessui/react'


const Login = () => {
  const { login } = useAuth();

  return (
    <div className="auth-actions">
      <Button onClick={login} className="rounded bg-gray-800 px-4 py-2 text-sm text-white data-active:bg-gray-700 data-hover:bg--500">
        Continue with GitHub
      </Button>
    </div>
  );
};

export default Login;
