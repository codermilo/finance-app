import { useEffect } from "react";
import axios from "axios";
import { useAuthDispatch } from "../context/AuthContext";

const useRegister = () => {
  const dispatch = useAuthDispatch();

  const registerUser = async (email, username, password) => {
    try {
      axios.defaults.xsrfCookieName = "csrftoken";
      axios.defaults.xsrfHeaderName = "X-CSRFToken";
      axios.defaults.withCredentials = true;

      const client = axios.create({
        baseURL: "http://127.0.0.1:8000",
      });

      const accountData = {
        current_balance: 500,
        bank_name: "Lloyds Bank",
      };

      const registerRes = await client.post("/api/register", {
        email: email,
        username: username,
        password: password,
        accountDetails: accountData,
      });

      console.log(registerRes.data);

      const loginRes = await client.post("/api/login", {
        username: username,
        password: password,
      });

      console.log(loginRes.data);

      dispatch({
        type: "login",
        isLoggedIn: true,
        username: loginRes.data.username,
        token: loginRes.data.token,
      });
    } catch (error) {
      console.error("Error during registration:", error);
      dispatch({
        type: "setError",
        error: error,
      });
    }
  };

  return { registerUser };
};

export default useRegister;
