import axios from "axios";
import { useAuth } from "../context/AuthContext";

const useCreateTransaction = () => {
  const user = useAuth();
  const token = user?.token;

  const createTransaction = async (transactionData, pay, updateData) => {
    console.log(updateData);
    console.log(pay);

    // Adding transaction_type = "income/expense" to request
    transactionData["transaction_type"] = pay;
    if (pay === "income") {
      transactionData.recipient = `Income`;
      transactionData.category = `Income`;
      console.log(transactionData.recipient);
      console.log(transactionData.expense);
    }
    try {
      const client = axios.create({
        baseURL: "http://127.0.0.1:8000",
        withCredentials: true, // Automatically sends cookies with requests
        xsrfCookieName: "csrftoken", // Name of the CSRF token cookie set by Django
        xsrfHeaderName: "X-CSRFToken", // Header name to send the CSRF token
      });

      const transactionRes = await client.post(
        "/api/create_transaction",
        transactionData,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      console.log(transactionRes);
    } catch (error) {
      console.error("Error during transaction creation:", error);
    }
  };

  return { createTransaction };
};

export default useCreateTransaction;
