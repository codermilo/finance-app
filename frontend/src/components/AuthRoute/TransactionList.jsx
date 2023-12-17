import React from "react";
import "../../App.css";
import { useAuth } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";

export default function TransactionList() {
  const { data, loading, error } = useFetch();
  //   console.log(data);
  const transactionsArray = data?.transactions;
  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>Error occurred while fetching data.</p>;
  }
  if (Array.isArray(transactionsArray) && transactionsArray.length > 0) {
    return (
      <div>
        <h2>Transactions</h2>
        <ul>
          {transactionsArray.map((transaction, index) => (
            <li key={index}>
              <p>Transaction ID: {transaction.transaction_id}</p>
              <p>Value: {transaction.value}</p>
              <p>Recurring: {transaction.recurring ? "Yes" : "No"}</p>
              <p>Description: {transaction.description}</p>
              <p>Category: {transaction.category}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  } else {
    return <p>No transactions available</p>;
  }
}
