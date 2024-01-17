import React from "react";
import "../../styles/Transaction.css";
import useFetch from "../../hooks/useFetch";
import Transaction from "../Transaction/Transaction";

export default function TransactionList(props) {
  // passing update function to transaction
  const { updateFunc } = props;
  // Passing form set function to transaction
  const { setFormFunc } = props;
  const { data, loading, error } = props;

  const transactionsArray = data?.transactions;
  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>Error occurred while fetching data.</p>;
  }
  if (Array.isArray(transactionsArray) && transactionsArray.length > 0) {
    return (
      <ul>
        {transactionsArray.map((transaction, index) => (
          <Transaction
            key={index}
            transaction={transaction}
            updateFunc={updateFunc}
            setFormFunc={setFormFunc}
            deleteFunc={props.deleteFunc}
            fetchFunc={props.fetchFunc}
          />
        ))}
      </ul>
    );
  } else {
    return <p>No transactions available</p>;
  }
}
