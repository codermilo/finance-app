import React, { useState } from "react";
import "../../styles/Transaction.css";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import useUpdateTransaction from "../../hooks/useUpdateTransaction";
import UpdateTransactionForm from "../Update/UpdateForm";
import formateDate from "../../hooks/FormatDate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDeleteLeft, faRotate } from "@fortawesome/free-solid-svg-icons";

export default function Transaction(props) {
  // get token for api call
  const user = useAuth();
  const token = user?.token;

  // get data from transaction
  const transaction = props.transaction;
  const id = transaction.transaction_id;
  const pay = transaction.transaction_type;
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
    "date",
    "recipient",
    "description",
    "category",
  ];

  // Format incoming transaction date
  const formattedDate = formateDate(transaction.date);
  // Importing delete function
  const { deleteFunc } = props;

  const { fetchFunc } = props;

  return (
    <div className="transaction__collection">
      {!updateForm ? (
        /* Show normal transaction details if not udpating */
        <div className="transaction__inner">
          <div className="transaction__data">
            <div className="date_recipient">
              <p>{formattedDate}</p>
              <p>{transaction.recipient}</p>
            </div>
            {/* <p>{transaction.description}</p> */}
            {transaction.transaction_type == "income" ? (
              <p className="income">{`+${transaction.value}`}</p>
            ) : (
              <p className="expense">{`-${transaction.value}`}</p>
            )}
            <p>{transaction.category}</p>
          </div>
          <div className="transaction__buttons">
            <button className="update_btn" onClick={() => setUpdateForm(true)}>
              <FontAwesomeIcon className="update_btn_icon" icon={faRotate} />
            </button>
            <button className="delete_btn" onClick={() => deleteFunc(id)}>
              <FontAwesomeIcon
                className="delete_btn_icon"
                icon={faDeleteLeft}
              />
            </button>
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
