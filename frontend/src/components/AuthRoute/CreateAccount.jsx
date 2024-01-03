import React, { useState } from "react";
import "../../App.css";
import CreateAccountForm from "../Form/CreateAccountForm";
import { useAuth, useAuthDispatch } from "../../context/AuthContext";
import UpdateAccountForm from "../Update/UpdateAccountForm";
import axios from "axios";

export default function CreateAccount({ fetchFunc }) {
  // Settings for Axios and Auth
  const user = useAuth();
  const token = user?.token;
  const dispatch = useAuthDispatch;
  axios.defaults.xsrfCookieName = "csrftoken";
  axios.defaults.xsrfHeaderName = "X-CSRFToken";
  axios.defaults.withCredentials = true;

  const hasAccount = user.account;

  // State to determine if component shows update form
  const [showUpdateForm, setShowUpdateform] = useState(false);

  // Delete account function
  const deleteAccount = async (id) => {
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
      const res = await client.delete(`/api/delete_account`);
      console.log(res);
      setTimeout(fetchFunc(), 500);
    } catch (error) {
      console.error("Error during account deletion:", error);
      console.error("Response data:", error.response.data);
    }
  };

  return (
    <div className="create__account">
      <h1>ACCOUNT</h1>
      {hasAccount && showUpdateForm ? (
        <div className="create_account__inner">
          <div className="update_account_form">
            <UpdateAccountForm
              fields={["bank name"]}
              fetchFunc={fetchFunc}
              showForm={setShowUpdateform}
            />
          </div>
          <button onClick={() => setShowUpdateform(false)}>Close</button>
        </div>
      ) : hasAccount ? (
        <div className="create_account__inner">
          <h1>{`BANK NAME: ${hasAccount.bank_name}`}</h1>
          <h1>{`BALANCE: £${hasAccount.current_balance}`}</h1>
          <div className="button_group">
            <button onClick={() => setShowUpdateform(true)}>
              Update Account Name
            </button>
            <button onClick={() => deleteAccount()}>Delete Account?</button>
          </div>
        </div>
      ) : (
        <CreateAccountForm
          fields={["bank name"]}
          form="createAccount"
          fetchFunc={fetchFunc}
        />
      )}
    </div>
  );
}
