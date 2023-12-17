import { useAuth, useAuthDispatch } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";

export default function LoginInstance() {
  // const authStatus = useAuth();
  // const dispatch = useAuthDispatch();

  const { data, loading, error } = useFetch();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error occurred while fetching data.</p>;
  }

  if (data) {
    return (
      <div>
        <h2>User Data</h2>
        <p>User ID: {data.user_id}</p>
        <p>Username: {data.username}</p>
        {data.account && (
          <div>
            <h3>Account Details</h3>
            <p>Account ID: {data.account.account_id}</p>
            <p>Current Balance: {data.account.current_balance}</p>
            <p>Bank Name: {data.account.bank_name}</p>
          </div>
        )}
        {/* {data.transactions && (
          <div>
            <h3>Transactions</h3>
            <ul>
              {data.transactions.map((transaction, index) => (
                <li key={index}>
                  <p>Transaction ID: {transaction.transaction_id}</p>
                  <p>Value: {transaction.value}</p>
                  <p>Recurring: {transaction.recurring ? "Yes" : "No"}</p>
                  <p>Description: {transaction.description}</p>
                  <p>Category: {transaction.category}</p>
                  <p>Linked Account: {transaction.account}</p>
                </li>
              ))}
            </ul>
          </div>
        )} */}
      </div>
    );
  } else {
    return <p>No user data available</p>;
  }

  return null;
}
