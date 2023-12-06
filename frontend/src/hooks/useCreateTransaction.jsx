import axios from "axios";
import { useAuth } from "../context/AuthContext";

const useCreateTransaction = () => {
  const user = useAuth();
  const accountId = user?.user?.account?.account_id;

  const createTransaction = async () => {
    if (!accountId) {
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

      const transactionRes = await client.post("/api/add_transaction", {
        value: 7,
        recurring: false,
        description: "test",
        category: 1,
        account: accountId,
      });

      console.log(transactionRes);
    } catch (error) {
      console.error("Error during transaction creation:", error);
    }
  };

  return { createTransaction };
};

export default useCreateTransaction;
