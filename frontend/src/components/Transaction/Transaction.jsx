import React, { useRef, useState, useEffect } from "react";
import "../../styles/Transaction.css";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import useUpdateTransaction from "../../hooks/useUpdateTransaction";
import UpdateTransactionForm from "../Update/UpdateForm";
import formateDate from "../../hooks/FormatDate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDeleteLeft,
  faRotate,
  faClose,
  faArrowLeftLong,
  faBurger,
  faSquareMinus,
} from "@fortawesome/free-solid-svg-icons";

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

  // Importing updateData function
  const { updateFunc } = props;
  const { showForm } = props;

  const combinedFunc = (transaction) => {
    updateFunc(transaction);
    showForm("transactionUpdateForm");
  };

  // Code to show option buttons or not
  const [isButtonVisible, setButtonVisibility] = useState(true);
  const [isHovered, setHovered] = useState(false);

  const toggleButton = () => {
    setButtonVisibility(!isButtonVisible);
  };

  // Code to track button clicks

  const divRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (divRef.current && !divRef.current.contains(event.target)) {
        setHovered(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`transaction__collection ${isHovered ? "hovered" : ""}`}
      // onMouseEnter={() => setHovered(true)}
      // onMouseLeave={() => setHovered(false)}
      onClick={() => setHovered(true)}
      ref={divRef}
    >
      {!updateForm ? (
        /* Show normal transaction details if not udpating */
        <div
          className={`transaction__inner ${isHovered ? "button-visible" : ""}`}
        >
          <div className="transaction__data">
            <div className="date_recipient">
              <FontAwesomeIcon
                className="transaction_category_icon"
                icon={faBurger}
              />
              <div className="dr_content">
                {/* <p className="date">{formattedDate}</p> */}
                <p className="secondary_color">{transaction.recipient}</p>
              </div>
            </div>
            {/* <p>{transaction.description}</p> */}
            {transaction.transaction_type == "income" ? (
              <p className="income">{`+ £${transaction.value}`}</p>
            ) : (
              <p className="expense">{`- £${transaction.value}`}</p>
            )}
            {/* <p>{transaction.category}</p> */}
          </div>
          {isButtonVisible && (
            <div className="transaction__buttons">
              <button
                className="update_btn"
                onClick={() => combinedFunc(transaction)}
              >
                <FontAwesomeIcon className="update_btn_icon" icon={faRotate} />
              </button>
              <button className="delete_btn" onClick={() => deleteFunc(id)}>
                <FontAwesomeIcon
                  className="delete_btn_icon"
                  icon={faSquareMinus}
                />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="transaction__inner">
          <div className="update__data">
            <div className="close_button_container">
              <button
                className="close_button"
                onClick={() => setUpdateForm(false)}
              >
                <FontAwesomeIcon
                  className="close_button_icon"
                  icon={faArrowLeftLong}
                />
              </button>
            </div>
            <UpdateTransactionForm
              fields={formFields}
              form="createTransaction"
              pay={pay}
              updateData={transaction}
              fetchFunc={fetchFunc}
              showForm={props.showForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}
