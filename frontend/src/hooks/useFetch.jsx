import { useEffect } from "react";
import axios from "axios";
import { useAuth, useAuthDispatch } from "../context/AuthContext";

const useFetch = () => {
  const user = useAuth();
  const token = user?.token;

  const dispatch = useAuthDispatch();

  axios.defaults.xsrfCookieName = "csrftoken";
  axios.defaults.xsrfHeaderName = "X-CSRFToken";
  axios.defaults.withCredentials = true;

  const client = axios.create({
    baseURL: "http://127.0.0.1:8000",
  });

  const fetchData = async () => {
    try {
      const res = await client.get("/api/get_user", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const accountData = res.data.account;
      const transactionData = res.data.current_month_transactions;

      const { expense_total, income_total, category_data, recipient_data } =
        res.data;

      const analyticsData = {
        expense_total,
        income_total,
        category_data,
        recipient_data,
      };

      dispatch({
        type: "get user",
        account: accountData,
        transactions: transactionData,
        analytics: analyticsData,
      });
    } catch (error) {
      console.error(error);
      // Handle the error as needed, e.g., you can dispatch an error action
    }
  };

  return { fetchData };

  // You're not returning anything from this hook
};

export default useFetch;
