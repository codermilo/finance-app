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

export default function App() {
  // let's grab the auth status from context
  const authStatus = useAuth();
  const [formOptions, setFormOptions] = useState("register");

  // console.log(authStatus);

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
            <div className="data_portal__container">
              <h1>Logged In!</h1>
              <LoginInstance />
            </div>
            <CreateAccount />
          </div>
          <div className="panel">
            <div className="create_transaction__container">
              <h1>CREATE NEW TRANSACTION</h1>
              <CreateTransactionForm
                fields={["value", "recurring", "description", "category"]}
                form="createTransaction"
              />
            </div>
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
