import React from "react";
import "./AddTransactionsExpenses.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faMinus } from "@fortawesome/free-solid-svg-icons";

export default function TransactionButtonComponent(props) {
  const { handleClick } = props;
  return (
    <div className="transaction_option__buttons">
      <button onClick={() => handleClick("expense")}>
        Add Expense
        <FontAwesomeIcon icon={faMinus} />
      </button>
      <button onClick={() => handleClick("income")}>
        <FontAwesomeIcon icon={faArrowRight} />
        Add Income
      </button>
    </div>
  );
}
