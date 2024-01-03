import axios from "axios";
import { useAuth } from "../context/AuthContext";

const useUpdateAccount = () => {
  const user = useAuth();
  const token = user?.token;

  const updateAccount = async (formData) => {
    try {
      const client = axios.create({
        baseURL: "http://127.0.0.1:8000",
        withCredentials: true, // Automatically sends cookies with requests
        xsrfCookieName: "csrftoken", // Name of the CSRF token cookie set by Django
        xsrfHeaderName: "X-CSRFToken", // Header name to send the CSRF token
      });

      console.log(formData);
      let bank = {
        bank_name: formData["bank name"],
      };

      const res = await client.put("/api/update_account", bank, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      console.log(res);
    } catch (error) {
      console.error("Error during account creation:", error);
    }
  };

  return { updateAccount };
};

export default useUpdateAccount;
