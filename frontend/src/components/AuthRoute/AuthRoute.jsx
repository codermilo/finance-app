import React from "react";
import Navbar from "../header/Navbar";
import TransactionButtonComponent from "../AddTransactionsExpenses/AddTransactionsExpenses";
import CreateTransactionForm from "../Form/CreateTransactionForm";
import TransactionList from "./TransactionList";
import { useState, useEffect } from "react";
import CreateAccount from "./CreateAccount";
import Footer from "../Footer/Footer";
import { useAuth, useAuthDispatch } from "../../context/AuthContext";
import axios from "axios";
import "../../styles/AuthRoute.css";
import useFetch from "../../hooks/useFetch";

export default function AuthRoute() {
  // Store form fields in an array
  const formFields = [
    "value",
    "recurring",
    "date",
    "recipient",
    "description",
    "category",
  ];
  // decide on whether to show add expense or income form
  const [transactionOptions, setTransactionOptions] = useState(null);

  // State to hold form data for updating a transaction?
  const [updateData, setUpdateData] = useState(null);

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
  };

  // Settings for Axios and Auth
  const user = useAuth();
  const token = user?.token;

  // Testing useFetch again
  console.log(user);
  const { fetchData } = useFetch();

  // Fetch transactions on initial component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Moving delete function here so I can call fetchTransactions on delete and passing it all to transactions
  // Delete transaction function
  const deleteTransaction = async (id) => {
    const client = axios.create({
      baseURL: "http://127.0.0.1:8000",
      withCredentials: true,
      xsrfCookieName: "csrftoken",
      xsrfHeaderName: "X-CSRFToken",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    try {
      const transactionRes = await client.delete(`/api/delete_transaction`, {
        data: { transaction_id: id },
      });
      console.log(transactionRes);
      fetchData();
    } catch (error) {
      console.error("Error during transaction deletion:", error);
      console.error("Response data:", error.response.data);
    }
  };

  return (
    <div className="App">
      <Navbar loginRegFunc={loginReg} />
      <div className="main__container">
        <div className="Auth_panel">
          {/* Either shows component to create account or shows account detail */}
          <CreateAccount />
          {/* Buttons to add expenses. Looks the same logged in or not */}
          <TransactionButtonComponent handleClick={transactionChange} />
        </div>
        <div className="panel">
          {transactionOptions === "expense" ? (
            <div className="create_transaction__container">
              <h1>ADD EXPENSE</h1>
              <CreateTransactionForm
                fields={formFields}
                form="createTransaction"
                pay="expense"
                updateData={updateData}
                transactionChange={transactionChange}
                closeFunc={transactionChange}
              />
            </div>
          ) : transactionOptions === "income" ? (
            <div className="create_transaction__container">
              <h1>ADD INCOME</h1>
              <CreateTransactionForm
                fields={formFields}
                form="createTransaction"
                pay="income"
                updateData={updateData}
                transactionChange={transactionChange}
              />
            </div>
          ) : (
            <div className="transactions">
              <h1>TRANSACTIONS</h1>
              <TransactionList
                updateFunc={updateTransaction}
                setFormFunc={transactionChange}
                deleteFunc={deleteTransaction}
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
