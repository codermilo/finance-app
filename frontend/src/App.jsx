import Navbar from "./components/header/Navbar";
import Footer from "./components/Footer/Footer";
import Form from "./components/Form/Form";
import "./App.css";
import { useState } from "react";
import LoginInstance from "./components/Login/LoginInstance";
import { useAuth } from "./context/AuthContext";
import CreateTransactionForm from "./components/Form/CreateTransactionForm";

export default function App() {
  // let's grab the auth status from context
  const authStatus = useAuth();
  const [formOptions, setFormOptions] = useState("register");

  console.log(authStatus.user?.account.account_id);

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
          <h1>Logged In!</h1>
          <LoginInstance />
          <CreateTransactionForm
            fields={[
              "value",
              "recurring",
              "description",
              "category",
              "account",
            ]}
            form="createTransaction"
          />
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
          <Form fields={["email", "password"]} form="login" />
        </div>
      )}
      <Footer />
    </div>
  );
}
