import Navbar from "./components/header/Navbar";
import Footer from "./components/Footer/Footer";
import Form from "./components/Form/Form";
import "./App.css";
import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import AuthRoute from "./components/AuthRoute/AuthRoute";

export default function App() {
  // let's grab the auth status from context
  const authStatus = useAuth();
  // decide on whether to show register or login form if not authorised
  const [formOptions, setFormOptions] = useState("register");

  // function sent to buttons on navbar to decide what options are shown in the form
  const loginReg = (arg) => {
    setFormOptions(arg);
  };

  // If logged in then present this code
  if (authStatus.isLoggedIn) {
    return <AuthRoute />;
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
