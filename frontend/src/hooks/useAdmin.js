import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useAdmin = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user.role !== "admin") {
      navigate("/login");
    }
  }, [navigate]);
};
