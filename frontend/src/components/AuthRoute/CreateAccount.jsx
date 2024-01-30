import React, { useState } from "react";
import "../../App.css";
import CreateAccountForm from "../Form/CreateAccountForm";
import { useAuth, useAuthDispatch } from "../../context/AuthContext";
import UpdateAccountForm from "../Update/UpdateAccountForm";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleMinus, faUserGear } from "@fortawesome/free-solid-svg-icons";
import Analytics from "./Analytics";
import BudgetBarChart from "../Charts/BudgetBarChart";

export default function CreateAccount({ fetchFunc, data }) {
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

  // // Delete account function
  // const deleteAccount = async (id) => {
  //   const client = axios.create({
  //     baseURL: "http://127.0.0.1:8000",
  //     withCredentials: true, // Automatically sends cookies with requests
  //     xsrfCookieName: "csrftoken", // Name of the CSRF token cookie set by Django
  //     xsrfHeaderName: "X-CSRFToken", // Header name to send the CSRF token
  //     headers: {
  //       "Content-Type": "application/json", // Set Content-Type explicitly
  //       Authorization: `Token ${token}`,
  //     },
  //   });

  //   try {
  //     const res = await client.delete(`/api/delete_account`);
  //     console.log(res);
  //     setTimeout(fetchFunc(), 500);
  //   } catch (error) {
  //     console.error("Error during account deletion:", error);
  //     console.error("Response data:", error.response.data);
  //   }
  // };

  return (
    <div className="create__account">
      {hasAccount && showUpdateForm ? (
        <div className="create_account__inner">
          {/* <div className="update_account_form">
            <UpdateAccountForm
              fields={["bank name"]}
              fetchFunc={fetchFunc}
              showForm={setShowUpdateform}
            />
          </div> */}
          <button onClick={() => setShowUpdateform(false)}>Close</button>
        </div>
      ) : hasAccount ? (
        <div className="create_account__inner">
          <div className="ca_left">
            <h1 className="balance secondary_color">
              <span>{`£ ${hasAccount.current_balance}`}</span> Balance
            </h1>

            <div className="ca_analytics">
              <div className="total_in">
                <h1 className="balance ">Income</h1>
                <span>{`+ £${data?.income_total}`}</span>
              </div>

              <BudgetBarChart
                totalIncome={data?.income_total}
                totalExpense={data?.expense_total}
                remainingBalance={hasAccount.current_balance}
              />
              <div className="total_out">
                <h1 className="balance ">Outgoing</h1>
                <span>{`- £${data?.expense_total}`}</span>
              </div>
            </div>
          </div>
          {/* <Analytics data={data} /> */}
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
