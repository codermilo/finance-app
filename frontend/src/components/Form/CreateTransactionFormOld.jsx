import React, { useState } from "react";
import "../../styles/Form.css";
import { useAuth } from "../../context/AuthContext";
import useCreateTransaction from "../../hooks/useCreateTransaction";

const CreateTransactionForm = ({ fields, form }) => {
  const user = useAuth();

  // Import useCreateTransaction hook
  const { createTransaction } = useCreateTransaction();

  // Set initial state for form data
  const initialFieldStates = fields.reduce((acc, field) => {
    acc[field] = "";
    return acc;
  }, {});

  // State to hold form data
  const [formData, setFormData] = useState({ ...initialFieldStates });

  // Destructure form data fields
  const {
    value,
    recurring,
    recurring_period,
    first_payment_date,
    final_payment_date,
    previous_payment_date,
    recipient,
    description,
    category,
  } = formData;

  // Handle form field changes
  const handleChange = (e, fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: e.target.value,
    });
  };

  // Handle form submission
  const submitTransCreation = (e) => {
    e.preventDefault();

    // Switch based on form type
    switch (form) {
      case "createTransaction":
        // Call createTransaction function from hook
        createTransaction(
          value,
          recurring,
          recurring_period,
          first_payment_date,
          final_payment_date,
          previous_payment_date,
          recipient,
          description,
          category
        );
        break;
      default:
        console.log("error, form submit not working");
        break;
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={submitTransCreation}>
        {/* Map over form fields */}
        {fields.map((field) => (
          <div key={field} className="form-group">
            <label className="label">{field}</label>
            <input
              type={field === "password" ? "password" : "text"}
              placeholder={`Enter ${field}`}
              value={formData[field]}
              onChange={(e) => handleChange(e, field)}
              className="input"
            />
          </div>
        ))}
        {/* Submit button */}
        <button type="submit" className="button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default CreateTransactionForm;
