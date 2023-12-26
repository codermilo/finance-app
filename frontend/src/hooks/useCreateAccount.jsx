import axios from "axios";
import { useAuth } from "../context/AuthContext";

const useCreateAccount = () => {
  const user = useAuth();
  const account = user?.account;
  const token = user?.token;
  // console.log("Bank:", bank); // Check the value of bank
  // console.log("Balance:", balance); // Check the value of balance

  const createAccount = async (bank, balance) => {
    if (account) {
      console.error("User or account ID is null");
      return;
    }

    try {
      const client = axios.create({
        baseURL: "http://127.0.0.1:8000",
        withCredentials: true, // Automatically sends cookies with requests
        xsrfCookieName: "csrftoken", // Name of the CSRF token cookie set by Django
        xsrfHeaderName: "X-CSRFToken", // Header name to send the CSRF token
      });

      const transactionRes = await client.post(
        "/api/create_account",
        {
          current_balance: balance,
          bank_name: bank,
          // user: userId,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      console.log(transactionRes);
    } catch (error) {
      console.error("Error during transaction deletion:", error);
      console.error("Response data:", error.response.data);
    }
  };

  return { createAccount };
};

export default useCreateAccount;
