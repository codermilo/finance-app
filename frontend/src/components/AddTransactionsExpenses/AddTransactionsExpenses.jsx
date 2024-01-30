import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faArrowLeftLong,
  faArrowDown,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";

export default function TransactionButtonComponent(props) {
  const { handleClick } = props;
  const { showButtonClick } = props;

  // combining both show new buttons and changing transactionOptions to "new" in AuthRoute
  const combinedOpenFunction = () => {
    // handleClick("new");
    showButtonClick(true);
  };

  const combinedCloseFunction = () => {
    handleClick("transactions");
    showButtonClick(false);
  };

  return (
    <>
      {props.showButtons ? (
        <div className="transaction_option__buttons">
          <button
            className="plus_button"
            onClick={() => combinedCloseFunction()}
          >
            <FontAwesomeIcon icon={faArrowLeftLong} />
          </button>
          <button className="pay_btns" onClick={() => handleClick("expense")}>
            Payment
            <FontAwesomeIcon icon={faArrowDown} />
          </button>
          <button className="pay_btns" onClick={() => handleClick("income")}>
            <FontAwesomeIcon icon={faArrowUp} />
            Income
          </button>
        </div>
      ) : (
        <div className="transaction_option__buttons">
          <button
            className="plus_button"
            onClick={() => combinedOpenFunction()}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      )}
    </>
  );
}
