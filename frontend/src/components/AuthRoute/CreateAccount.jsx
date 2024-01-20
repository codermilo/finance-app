import React, { useState } from "react";
import "../../App.css";
import CreateAccountForm from "../Form/CreateAccountForm";
import { useAuth, useAuthDispatch } from "../../context/AuthContext";
import UpdateAccountForm from "../Update/UpdateAccountForm";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleMinus, faUserGear } from "@fortawesome/free-solid-svg-icons";
import Analytics from "./Analytics";
import useFetch from "../../hooks/useFetch";

export default function CreateAccount() {
  // Settings for Axios and Auth
  const user = useAuth();
  const token = user?.token;
  const dispatch = useAuthDispatch;
  axios.defaults.xsrfCookieName = "csrftoken";
  axios.defaults.xsrfHeaderName = "X-CSRFToken";
  axios.defaults.withCredentials = true;

  const hasAccount = user.account;
  const { fetchData } = useFetch();

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
      setTimeout(fetchData(), 500);
      // setTimeout(fetchFunc(), 500);
    } catch (error) {
      console.error("Error during account deletion:", error);
      console.error("Response data:", error.response.data);
    }
  };

  return (
    <div className="create__account">
      {hasAccount && showUpdateForm ? (
        <div className="create_account__inner">
          <div className="update_account_form">
            <UpdateAccountForm
              fields={["bank name"]}
              showForm={setShowUpdateform}
            />
          </div>
          <button onClick={() => setShowUpdateform(false)}>Close</button>
        </div>
      ) : hasAccount ? (
        <div className="create_account__inner">
          <div className="ca_left">
            <h1 className="balance">{`£${user.account.current_balance}`}</h1>

            <div className="account_name_button_group">
              <h1 className="account_name">{`${user.account.bank_name}`}</h1>
              <button onClick={() => setShowUpdateform(true)}>
                <FontAwesomeIcon icon={faUserGear} />
              </button>
              <button onClick={() => deleteAccount()}>
                <FontAwesomeIcon icon={faCircleMinus} />
              </button>
            </div>
          </div>
          <Analytics />
        </div>
      ) : (
        <CreateAccountForm
          fields={["bank name"]}
          form="createAccount"
          showForm={setShowUpdateform}
        />
      )}
    </div>
  );
}
