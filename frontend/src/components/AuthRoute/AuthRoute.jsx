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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import Analytics from "./Analytics";
import UpdateAccountForm from "../Update/UpdateAccountForm";
import SettingsPage from "../Settings/SettingsPage";
import UpdateTransactionForm from "../Update/UpdateForm";
import BottomNav from "./BottomNAv";

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
  const [transactionOptions, setTransactionOptions] = useState("transactions");

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
      fetchTransactions();
    } catch (error) {
      console.error("Error during transaction deletion:", error);
      console.error("Response data:", error.response.data);
    }
  };

  const hasAccount = user.account;

  return (
    <div className="App">
      <div className="Auth_panel">
        {hasAccount ? (
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
                  fetchFunc={fetchTransactions}
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
                  fetchFunc={fetchTransactions}
                />
              </div>
            ) : transactionOptions === "analytics" ? (
              <div className="panel">
                <Navbar loginRegFunc={loginReg} />
                <Analytics data={data} />
                <div className="bottom_navbar">
                  <BottomNav
                    transactionChange={setTransactionOptions}
                    isActive={transactionOptions}
                  />
                </div>
              </div>
            ) : transactionOptions === "updateForm" ? (
              <div className="update_account_form">
                <h1>Update Account Name</h1>
                <UpdateAccountForm
                  fields={["bank name"]}
                  fetchFunc={fetchTransactions}
                  showForm={setTransactionOptions}
                />
              </div>
            ) : transactionOptions === "transactionUpdateForm" ? (
              <div className="panel">
                <button
                  className="back_btn"
                  onClick={() => setTransactionOptions("transactions")}
                >
                  <FontAwesomeIcon icon={faArrowLeftLong} />
                </button>
                <div className="update_form">
                  <h1>Update Transaction</h1>
                  <UpdateTransactionForm
                    fields={formFields}
                    form="createTransaction"
                    pay={updateData.transaction_type}
                    updateData={updateData}
                    fetchFunc={fetchTransactions}
                    transactionChange={transactionChange}
                  />
                </div>
              </div>
            ) : transactionOptions === "settings" ? (
              <SettingsPage
                fields={["bank name"]}
                fetchTransactions={fetchTransactions}
                showForm={setTransactionOptions}
              />
            ) : (
              <div className="panel">
                <Navbar loginRegFunc={loginReg} />
                <CreateAccount fetchFunc={fetchTransactions} data={data} />
                <div className="transactions">
                  <p className="header">Transaction history</p>
                  <TransactionList
                    updateFunc={updateTransaction}
                    setFormFunc={transactionChange}
                    data={data}
                    loading={loading}
                    error={error}
                    deleteFunc={deleteTransaction}
                    fetchFunc={fetchTransactions}
                    showForm={setTransactionOptions}
                  />
                </div>
                <div className="bottom_navbar">
                  <BottomNav
                    transactionChange={setTransactionOptions}
                    isActive={transactionOptions}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="panel">
            <Navbar loginRegFunc={loginReg} />
            <CreateAccount fetchFunc={fetchTransactions} data={data} />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
