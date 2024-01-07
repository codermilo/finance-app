import React from "react";
import Navbar from "../header/Navbar";
import TransactionButtonComponent from "../AddTransactionsExpenses/AddTransactionsExpenses";
import CreateTransactionForm from "../Form/CreateTransactionForm";
import TransactionList from "./TransactionList";
import { useState, useEffect } from "react";
import useFetch from "../../hooks/useFetch";
import CreateAccount from "./CreateAccount";
import Footer from "../Footer/Footer";
import { useAuth, useAuthDispatch } from "../../context/AuthContext";
import axios from "axios";

export default function AuthRoute() {
  // Store form fields in an array
  const formFields = [
    "value",
    "recurring",
    // "recurring_period",
    // "first_payment_date",
    // "final_payment_date",
    // "previous_payment_date",
    "date",
    "recipient",
    "description",
    "category",
  ];
  // decide on whether to show add expense or income form
  const [transactionOptions, setTransactionOptions] = useState(null);

  // State to hold form data for updating a transaction?
  const [updateData, setUpdateData] = useState(null);
  // console.log(updateData);

  // write function to toggle transactionOptions to send to transaction button component
  const transactionChange = (arg) => {
    setTransactionOptions(arg);
  };

  // function sent to buttons on navbar to decide what options are shown in the form
  const loginReg = (arg) => {
    setFormOptions(arg);
  };

  // function to set update transaction data to pass to transaction form
  const updateTransaction = (data) => {
    setUpdateData(data);
    // console.log(updateData);
  };

  // Moving my useFetch to App and passing loading, error and data to Transaction List
  // Setting states for Data Loading and Error
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Settings for Axios and Auth
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

  // Making my fetch an async function that can be called in other functions rather than a hook
  const fetchTransactions = async () => {
    setLoading(true);
    setTimeout(() => {
      client
        .get("/api/get_user", {
          headers: {
            Authorization: `Token ${token}`,
          },
        })
        .then((res) => {
          const accountData = res.data.account;
          console.log(`new request data is:`, res.data.transactions);
          setData(res.data);
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
    }, 100);
  };

  // Fetch transactions on initial component mount
  useEffect(() => {
    fetchTransactions();
  }, []); // Empty dependency array ensures this effect runs only once

  // Moving delete function here so I can call fetchTransactions on delete and passing it all to transactions
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

  return (
    <div className="App">
      <Navbar loginRegFunc={loginReg} />
      <div className="main__container">
        <div className="panel">
          {/* Buttons to add expenses. Looks the same logged in or not */}
          <TransactionButtonComponent handleClick={transactionChange} />
          {/* Either shows component to create account or shows account detail */}
          <CreateAccount fetchFunc={fetchTransactions} />
        </div>
        <div className="panel">
          {transactionOptions === "expense" ? (
            <div className="create_transaction__container">
              <button onClick={() => transactionChange(null)}>Close</button>
              <h1>ADD EXPENSE</h1>
              <CreateTransactionForm
                fields={formFields}
                form="createTransaction"
                pay="expense"
                updateData={updateData}
                transactionChange={transactionChange}
                fetchFunc={fetchTransactions}
              />
            </div>
          ) : transactionOptions === "income" ? (
            <div className="create_transaction__container">
              <button onClick={() => transactionChange(null)}>Close</button>
              <h1>ADD INCOME</h1>
              <CreateTransactionForm
                fields={formFields}
                form="createTransaction"
                pay="income"
                updateData={updateData}
                transactionChange={transactionChange}
                fetchFunc={fetchTransactions}
              />
            </div>
          ) : (
            <div className="transactions">
              <h1>TRANSACTIONS</h1>
              <TransactionList
                updateFunc={updateTransaction}
                setFormFunc={transactionChange}
                data={data}
                loading={loading}
                error={error}
                deleteFunc={deleteTransaction}
                fetchFunc={fetchTransactions}
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
