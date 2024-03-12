import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useAccess = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/login");
    }
  }, [navigate]);
};
