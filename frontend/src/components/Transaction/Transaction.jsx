import React, { useState } from "react";
import "./Transaction.css";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import useUpdateTransaction from "../../hooks/useUpdateTransaction";
import UpdateTransactionForm from "../Update/UpdateForm";

export default function Transaction(props) {
  // get token for api call
  const user = useAuth();
  const token = user?.token;

  // get data from transaction
  const transaction = props.transaction;
  const meta = transaction.transaction_meta_data_id;
  const id = transaction.transaction_id;
  const pay = meta.transaction_type;
  // console.log(transaction);

  // State to decide if update transaction form is shown
  const [updateForm, setUpdateForm] = useState(false);

  // Importing updateTransaction function
  const { updateTransaction } = useUpdateTransaction();

  // Calling update transaction hook which creates new transaction and deletes old one
  // Needs to take two arguments? Old transaction and new one
  // Needs to take value and id from old transaction
  // const handleClick = () => {
  //   updateTransaction();
  // };

  // Store form fields in an array
  const formFields = [
    "value",
    "recurring",
    "recurring_period",
    "first_payment_date",
    "final_payment_date",
    "previous_payment_date",
    "recipient",
    "description",
    "category",
  ];

  // Importing delete function
  const { deleteFunc } = props;

  const { fetchFunc } = props;

  return (
    <div className="transaction__collection">
      {!updateForm ? (
        /* Show normal transaction details if not udpating */
        <div className="transaction__inner">
          <div className="transaction__data">
            <p>{meta.recipient}</p>
            {/* <p>{meta.description}</p> */}
            <p>{meta.value}</p>
            <p>{meta.category}</p>
            <p>{meta.transaction_type}</p>
          </div>
          <div className="transaction__buttons">
            <button onClick={() => setUpdateForm(true)}>Update</button>
            <button onClick={() => deleteFunc(id)}>Delete</button>
          </div>
        </div>
      ) : (
        <div className="transaction__iner">
          <div className="transaction__data">
            <UpdateTransactionForm
              fields={formFields}
              form="createTransaction"
              pay={pay}
              updateData={transaction}
              fetchFunc={fetchFunc}
            />
          </div>
          <div className="transaction__buttons">
            <button onClick={() => setUpdateForm(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
