import React from "react";
import "./AddTransactionsExpenses.css";

export default function TransactionButtonComponent(props) {
  const { handleClick } = props;
  return (
    <div className="transaction_option__buttons">
      <button onClick={() => handleClick("expense")}>Add Expense</button>
      <button onClick={() => handleClick("income")}>Add Income</button>
    </div>
  );
}
