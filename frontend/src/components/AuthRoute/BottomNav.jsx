import React, { useState } from "react";
import TransactionButtonComponent from "../AddTransactionsExpenses/AddTransactionsExpenses";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faCog,
  faChartSimple,
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/AuthRoute.css";

export default function BottomNav(props) {
  // state to show income or expense buttons
  const [showButtons, setShowButtons] = useState(false);
  const showButtonClick = (arg) => {
    setShowButtons(arg);
  };

  // Import setTransactionChange
  const { transactionChange } = props;

  return (
    <div className="bottom_navbar">
      {!showButtons ? (
        <div className="bottom_nav_collection">
          <button
            className={`home_btn ${
              props.isActive == "transactions" ? "active" : ""
            }`}
            onClick={() => transactionChange("transactions")}
          >
            <FontAwesomeIcon icon={faHouse} />
            <span>Home</span>
          </button>
          <button
            className={`bottom_nav_btns ${
              props.isActive == "analytics" ? "active" : ""
            }`}
            onClick={() => transactionChange("analytics")}
          >
            <FontAwesomeIcon icon={faChartSimple} />
          </button>
          <button
            className="bottom_nav_btns"
            onClick={() => transactionChange("settings")}
          >
            <FontAwesomeIcon icon={faCog} />
          </button>
        </div>
      ) : null}
      <TransactionButtonComponent
        handleClick={transactionChange}
        showButtons={showButtons}
        showButtonClick={showButtonClick}
      />
    </div>
  );
}
