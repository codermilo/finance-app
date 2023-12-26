import React from "react";
import "./Transaction.css";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function Transaction(props) {
  // get token for api call
  const user = useAuth();
  const token = user?.token;

  // get data from transaction
  const transaction = props.transaction;
  const meta = transaction.transaction_meta_data_id;
  const id = transaction.transaction_id;
  console.log(transaction);

  // Update transaction function
  const updateTransaction = async () => {
    console.log("Updating transaction");
  };

  // Delete transaction function
  const deleteTransaction = async (id) => {
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
      const transactionRes = await client.delete(`/api/delete_transaction`, {
        data: { transaction_id: id }, // Data goes here
      });
      console.log(transactionRes);
    } catch (error) {
      console.error("Error during transaction deletion:", error);
      console.error("Response data:", error.response.data);
    }
  };

  return (
    <div className="transaction__collection">
      <div className="transaction__data">
        <p>{meta.recipient}</p>
        {/* <p>{meta.description}</p> */}
        <p>{transaction.value}</p>
        <p>{meta.category}</p>
      </div>
      <div className="transaction__buttons">
        <button onClick={() => deleteTransaction(id)}>Delete</button>
        <button onClick={() => updateTransaction()}>Update</button>
      </div>
    </div>
  );
}
