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

  // New Code
  // Group transactions by date
  const groupedTransactions = transactionsArray.reduce(
    (grouped, transaction) => {
      const date = new Date(transaction.date);
      const dayMonthKey = `${date.getDate()} ${date.toLocaleString("en-us", {
        month: "long",
      })}`;

      if (!grouped[dayMonthKey]) {
        grouped[dayMonthKey] = [];
      }

      grouped[dayMonthKey].push(transaction);
      return grouped;
    },
    {}
  );

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>Error occurred while fetching data.</p>;
  }
  if (Array.isArray(transactionsArray) && transactionsArray.length > 0) {
    // return (
    //   <ul>
    //     {transactionsArray.map((transaction, index) => (
    //       <Transaction
    //         key={index}
    //         transaction={transaction}
    //         updateFunc={updateFunc}
    //         setFormFunc={setFormFunc}
    //         deleteFunc={props.deleteFunc}
    //         fetchFunc={props.fetchFunc}
    //         showForm={props.showForm}
    //       />
    //     ))}
    //   </ul>
    // );
    // Map over grouped transactions
    return (
      <>
        {Object.entries(groupedTransactions).map(
          ([dayMonth, transactions], index) => (
            <div key={index}>
              <h1>{dayMonth}</h1>
              <ul>
                {transactions.map((transaction, innerIndex) => (
                  <Transaction
                    key={innerIndex}
                    transaction={transaction}
                    updateFunc={updateFunc}
                    setFormFunc={setFormFunc}
                    deleteFunc={props.deleteFunc}
                    fetchFunc={props.fetchFunc}
                    showForm={props.showForm}
                  />
                ))}
              </ul>
            </div>
          )
        )}
      </>
    );
  } else {
    return <p>No transactions available</p>;
  }
}
