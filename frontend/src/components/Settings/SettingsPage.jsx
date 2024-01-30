import React, { useState } from "react";
import UpdateAccountForm from "../Update/UpdateAccountForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDeleteLeft,
  faRotate,
  faClose,
  faHouse,
  faBarChart,
  faCog,
  faChartSimple,
  faArrowLeftLong,
} from "@fortawesome/free-solid-svg-icons";

export default function SettingsPage({ fetchTransactions, showForm }) {
  const [option, setOption] = useState(null);

  // Moving account delete here
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
      setTimeout(fetchTransactions(), 500);
    } catch (error) {
      console.error("Error during account deletion:", error);
      console.error("Response data:", error.response.data);
    }
  };

  return (
    <div className="settings_container">
      {option === "updateForm" ? (
        <div className="update_account_form">
          <button
            className="back_btn secondary_color"
            onClick={() => setOption(null)}
          >
            <FontAwesomeIcon icon={faArrowLeftLong} />
          </button>
          <h1>Update Account Name</h1>
          <UpdateAccountForm
            fields={["bank name"]}
            fetchFunc={fetchTransactions}
            showForm={showForm}
          />
        </div>
      ) : (
        <div className="settings_container_inner">
          <button
            className="back_btn secondary_color"
            onClick={() => showForm("transactions")}
          >
            <FontAwesomeIcon icon={faArrowLeftLong} />
          </button>
          <h1 className="secondary_color">Settings Page</h1>
          <button
            className="settings_btn"
            onClick={() => setOption("updateForm")}
          >
            Change Username
          </button>
          <button
            className="settings_btn"
            onClick={() => setOption("updateForm")}
          >
            Change Account Name
          </button>
          <button
            className="settings_btn delete_acc_btn"
            onClick={() => setOption("deleteAccount")}
          >
            Delete Account
          </button>
        </div>
      )}
    </div>
  );
}
