import { useEffect, useState } from "react";

export const useUser = () => {
  const [user, setUser] = useState();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setUser(user);
  }, []);
  return user;
};
