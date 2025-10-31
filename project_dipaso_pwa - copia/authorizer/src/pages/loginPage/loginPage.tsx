import React from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "./../../components/loginForm/loginForm";
import { authService } from "../../services/api/authServices";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  // Función que se pasa al LoginForm
  const handleLogin = async (username: string, password: string) => {
    const result = await authService.login(username, password);
    if (result.success && result.user) {
      navigate("/dashboard"); // Redirige al dashboard
    }
    return result;
  };

  return (
    <div className="flex justify-center items-center w-screen h-screen bg-gray-100 p-4">
          <LoginForm onLogin={handleLogin} />
     
    </div>
  );
};

export default LoginPage;
