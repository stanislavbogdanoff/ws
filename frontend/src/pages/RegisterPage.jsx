import { useEffect, useState } from "react";
import { useRegisterMutation } from "../redux/api/authApi";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    name: null,
    password: null,
    jobTitle: null,
    age: null,
    role: null,
  });

  const [register, { isSuccess: registerSuccess }] = useRegisterMutation();

  console.log("registerSuccess", registerSuccess);

  useEffect(() => {
    if (registerSuccess) navigate("/");
  }, [registerSuccess, navigate]);

  return (
    <main>
      <h1>Enter your credentials</h1>
      <div className="input-box">
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
        <input
          type="text"
          placeholder="jobTitle"
          onChange={(e) => {
            setCredentials((prev) => ({ ...prev, jobTitle: e.target.value }));
          }}
        />
        <input
          type="text"
          placeholder="age"
          onChange={(e) => {
            setCredentials((prev) => ({ ...prev, age: +e.target.value }));
          }}
        />
      </div>
      <button onClick={() => register(credentials)}>Register</button>
    </main>
  );
};

export default RegisterPage;
