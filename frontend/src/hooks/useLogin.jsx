import axios from "axios";
import { useAuthDispatch } from "../context/AuthContext";

const useLogin = () => {
  const dispatch = useAuthDispatch();

  const loginUser = async (email, password) => {
    try {
      axios.defaults.xsrfCookieName = "csrftoken";
      axios.defaults.xsrfHeaderName = "X-CSRFToken";
      axios.defaults.withCredentials = true;

      const client = axios.create({
        baseURL: "http://127.0.0.1:8000",
      });

      const loginRes = await client.post("/api/login", {
        email: email,
        password: password,
      });

      dispatch({
        type: "login",
        isLoggedIn: true,
        user: loginRes.data.user,
      });
    } catch (error) {
      console.error("Error during login:", error);
      dispatch({
        type: "setError",
        error: error,
      });
    }
  };

  return { loginUser };
};

export default useLogin;
