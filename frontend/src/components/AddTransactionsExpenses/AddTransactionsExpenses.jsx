import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faMinus,
  faArrowRightLong,
} from "@fortawesome/free-solid-svg-icons";

export default function TransactionButtonComponent(props) {
  const { handleClick } = props;
  return (
    <div className="transaction_option__buttons">
      <button onClick={() => handleClick("expense")}>
        Add Expense
        <FontAwesomeIcon icon={faMinus} />
      </button>
      <button onClick={() => handleClick("income")}>
        <FontAwesomeIcon icon={faArrowRightLong} />
        Add Income
      </button>
    </div>
  );
}
