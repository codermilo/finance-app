import Navbar from "./components/header/Navbar";
import Footer from "./components/Footer/Footer";
import Form from "./components/Form/Form";
import "./App.css";
import { useState } from "react";
import LoginInstance from "./components/AuthRoute/LoginInstance";
import { useAuth } from "./context/AuthContext";
import CreateTransactionForm from "./components/Form/CreateTransactionForm";
import CreateAccount from "./components/AuthRoute/CreateAccount";
import TransactionList from "./components/AuthRoute/TransactionList";
import DatePicker from "./components/DatePicker/DatePicker";
import DatePickerComponent from "./components/DatePicker/DatePicker";
import TransactionButtonComponent from "./components/AddTransactionsExpenses/AddTransactionsExpenses";

export default function App() {
  // let's grab the auth status from context
  const authStatus = useAuth();
  // decide on whether to show register or login form if not authorised
  const [formOptions, setFormOptions] = useState("register");
  // decide on whether to show add expense or income form
  const [transactionOptions, setTransactionOptions] = useState(true);

  // write function to toggle transactionOptions to send to transaction button component
  const transactionChange = (arg) => {
    setTransactionOptions(arg);
  };

  // function sent to buttons on navbar to decide what options are shown in the form
  const loginReg = (arg) => {
    setFormOptions(arg);
  };

  // If logged in then present this code
  if (authStatus.isLoggedIn) {
    return (
      <div className="App">
        <Navbar loginRegFunc={loginReg} />
        <div className="main__container">
          <div className="panel">
            {/* Buttons to add expenses. Looks the same logged in or not */}
            {/* <div className="data_portal__container">
              <h1>Logged In!</h1>
              <LoginInstance />
            </div> */}
            <TransactionButtonComponent handleClick={transactionChange} />
            {/* Either shows component to create account or shows account detail */}
            <CreateAccount />
          </div>
          <div className="panel">
            {transactionOptions ? (
              <div className="create_transaction__container">
                <h1>ADD EXPENSE</h1>
                <CreateTransactionForm
                  fields={[
                    "value",
                    "recurring",
                    "recurring_period",
                    "first_payment_date",
                    "final_payment_date",
                    "previous_payment_date",
                    "recipient",
                    "description",
                    "category",
                  ]}
                  form="createTransaction"
                  pay="expense"
                />
              </div>
            ) : (
              <div className="create_transaction__container">
                <h1>ADD INCOME</h1>
                <CreateTransactionForm
                  fields={[
                    "value",
                    "recurring",
                    "recurring_period",
                    "first_payment_date",
                    "final_payment_date",
                    "previous_payment_date",
                    "recipient",
                    "description",
                    "category",
                  ]}
                  form="createTransaction"
                  pay="income"
                />
              </div>
            )}

            <div className="transactions">
              <h1>TRANSACTIONS</h1>
              <TransactionList />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If not logged in the present this code
  return (
    <div className="App">
      <Navbar loginRegFunc={loginReg} />
      {formOptions == "register" ? (
        <div className="main__container">
          <Form fields={["username", "email", "password"]} form="register" />
        </div>
      ) : (
        <div className="main__container">
          <Form fields={["username", "password"]} form="login" />
        </div>
      )}
      <Footer />
    </div>
  );
}
