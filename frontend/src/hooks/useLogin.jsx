import axios from "axios";
import { useAuthDispatch } from "../context/AuthContext";

const useLogin = () => {
  const dispatch = useAuthDispatch();

  const loginUser = async (username, password) => {
    try {
      axios.defaults.xsrfCookieName = "csrftoken";
      axios.defaults.xsrfHeaderName = "X-CSRFToken";
      axios.defaults.withCredentials = true;

      const client = axios.create({
        baseURL: "http://127.0.0.1:8000",
      });

      // const quotedUsername = '"' + username + '"';
      // const quotedPassword = '"' + password + '"';

      // console.log("Quoted Username:", quotedUsername);
      // console.log("Quoted Password:", quotedPassword);

      // console.log(username, password);

      const loginRes = await client.post("/api/login", {
        username: username,
        password: password,
      });

      console.log(loginRes);

      // const loginRes = await client.post("/api/login", {
      //   username: "new7",
      //   password: "yourpassword7",
      // });

      dispatch({
        type: "login",
        isLoggedIn: true,
        username: loginRes.data.username,
        userId: loginRes.data.user_id,
        token: loginRes.data.token,
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
