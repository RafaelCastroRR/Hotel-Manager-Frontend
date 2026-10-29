import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login as loginRequest } from "../../services/api.js";
import { useToast } from "@chakra-ui/react";
import useAuthStore from "../stores/authStore";

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const loginStore = useAuthStore((state) => state.login);
  const logoutStore = useAuthStore((state) => state.logout);

  const handleLogin = async (data) => {
    setLoading(true);

    const response = await loginRequest(data);

    if (response.error) {
      toast({
        title: "Error de inicio de sesión",
        description: response.error?.response?.data?.msg || response.error?.response?.data || "Ocurrió un error durante el inicio de sesión.",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
      setLoading(false);
      return { success: false, error: response.error?.response?.data };
    }

    const { token, user } = response.data;
    loginStore(user, token);

    setLoading(false);
    toast({
      title: "Inicio de sesión exitoso",
      description: `¡Bienvenido de nuevo, ${user.nombre || user.email}!`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    if (user.role === "MANAGER_ROLE") {
      navigate("/admin/hotel");
    } else if (user.role === "ADMIN_ROLE") {
      navigate("/admin/platform");
    } else {
      const destination = location.state?.from?.pathname || location.state?.from || "/";
      navigate(destination);
    }
    return { success: true };
  };

  const handleLogout = () => {
    logoutStore();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
    navigate("/login");
  };

  return {
    login: handleLogin,
    logout: handleLogout,
    loading,
  };
};

export default useLogin;
