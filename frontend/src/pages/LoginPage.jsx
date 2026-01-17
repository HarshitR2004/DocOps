import Login from "../components/auth/Login";

const LoginPage = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md dark:bg-gray-600 p-6 flex flex-col items-center text-center gap-4">
        <h1 className="text-2xl font-semibold text-white">Welcome To DocOps</h1>
        <div className="w-full">
          <Login />
        </div>
      </div>
    </div>
   

  );
};

export default LoginPage;
