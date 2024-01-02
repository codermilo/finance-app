import React, { useState, useEffect } from "react";
import "../Transaction/Transaction.css";
import useFetch from "../../hooks/useFetch";
import Transaction from "../Transaction/Transaction";
import axios from "axios";
import { useAuth, useAuthDispatch } from "../../context/AuthContext";

export default function TransactionList(props) {
  // axios settings for my fetch hook
  const user = useAuth();
  const token = user?.token;

  const dispatch = useAuthDispatch();

  axios.defaults.xsrfCookieName = "csrftoken";
  axios.defaults.xsrfHeaderName = "X-CSRFToken";
  axios.defaults.withCredentials = true;

  // LATER I NEED TO ENV THE URLS !!!
  const client = axios.create({
    baseURL: "http://127.0.0.1:8000",
  });

  // passing update function to transaction
  const { updateFunc } = props;
  // Passing form set function to transaction
  const { setFormFunc } = props;
  // const { data, loading, error } = useFetch();

  // Making a fetch hook here so that I can save to state in this component and re-use on transaction delete.
  // State for transactions
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Function to fetch transaction data
  const fetchTransactions = async () => {
    setLoading(true);
    client
      .get("/api/get_user", {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then((res) => {
        const accountData = res.data.account;
        // console.log(res.data);
        setTransactions(res.data.transactions);
        setLoading(false);
        dispatch({
          type: "update account",
          account: accountData,
        });
      })
      .catch((error) => {
        console.log(error);
        setError(true);
        setLoading(false);
      });
  };

  // moved delete function to here as well.
  // Delete transaction function
  const deleteTransaction = async (id) => {
    const client = axios.create({
      baseURL: "http://127.0.0.1:8000",
      withCredentials: true, // Automatically sends cookies with requests
      xsrfCookieName: "csrftoken", // Name of the CSRF token cookie set by Django
      xsrfHeaderName: "X-CSRFToken", // Header name to send the CSRF token
      headers: {
        "Content-Type": "application/json", // Set Content-Type explicitly
        Authorization: `Token ${token}`,
      },
    });

    try {
      const transactionRes = await client.delete(`/api/delete_transaction`, {
        data: { transaction_id: id }, // Data goes here
      });
      console.log(transactionRes);
      fetchTransactions();
    } catch (error) {
      console.error("Error during transaction deletion:", error);
      console.error("Response data:", error.response.data);
    }
  };

  // Fetch transactions on initial component mount
  useEffect(() => {
    fetchTransactions();
  }, []); // Empty dependency array ensures this effect runs only once

  // const transactionsArray = data?.transactions;

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>Error occurred while fetching data.</p>;
  }
  if (Array.isArray(transactions) && transactions.length > 0) {
    return (
      <ul>
        {transactions.map((transaction, index) => (
          <Transaction
            key={index}
            transaction={transaction}
            updateFunc={updateFunc}
            setFormFunc={setFormFunc}
            deleteTransaction={deleteTransaction}
          />
        ))}
      </ul>
    );
  } else {
    return <p>No transactions available</p>;
  }
}
