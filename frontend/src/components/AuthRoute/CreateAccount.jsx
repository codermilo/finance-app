import React from "react";
import "../../App.css";
import CreateAccountForm from "../Form/CreateAccountForm";
import { useAuth } from "../../context/AuthContext";

export default function CreateAccount() {
  const user = useAuth();
  const hasAccount = user.account;
  console.log(hasAccount);

  return (
    <div className="create__account">
      <h1>ACCOUNT</h1>
      {hasAccount ? (
        <>
          <h1>{`BANK NAME: ${hasAccount.bank_name}`}</h1>
          <h1>{`BALANCE: £${hasAccount.current_balance}`}</h1>
        </>
      ) : (
        <CreateAccountForm
          fields={["current balance", "bank name"]}
          form="createAccount"
        />
      )}
    </div>
  );
}
