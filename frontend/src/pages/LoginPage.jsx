import { useEffect, useState } from "react";
import { useLoginMutation } from "../redux/api/authApi";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    name: null,
    password: null,
  });

  const [login, { isSuccess: loginSuccess }] = useLoginMutation();

  useEffect(() => {
    if (loginSuccess) navigate("/");
  }, [loginSuccess, navigate]);

  return (
    <main>
      <h1>Enter your credentials</h1>
      <input
        type="text"
        placeholder="name"
        onChange={(e) => {
          setCredentials((prev) => ({ ...prev, name: e.target.value }));
        }}
      />
      <input
        type="text"
        placeholder="password"
        onChange={(e) => {
          setCredentials((prev) => ({ ...prev, password: e.target.value }));
        }}
      />
      <button onClick={() => login(credentials)}>Login</button>
    </main>
  );
};

export default LoginPage;
