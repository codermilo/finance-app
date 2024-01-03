import React, { useState } from "react";
import "../../styles/Form.css";
import { useAuth } from "../../context/AuthContext";
import useCreateAccount from "../../hooks/useCreateAccount";

const CreateAccountForm = ({ fields, form, fetchFunc }) => {
  const user = useAuth();

  // Import useCreateTransaction hook
  const { createAccount } = useCreateAccount();

  // Set initial state for form data
  const initialFieldStates = fields.reduce((acc, field) => {
    acc[field] = "";
    return acc;
  }, {});

  // State to hold form data
  const [formData, setFormData] = useState({ ...initialFieldStates });

  // Destructure form data fields
  // const bank = formData["current balance"];
  // const balance = formData["bank name"];
  // console.log(bank);

  // Handle form field changes
  const handleChange = (e, fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: e.target.value,
    });
  };

  // Handle form submission
  const submitAccountCreation = (e) => {
    e.preventDefault();

    // Switch based on form type
    switch (form) {
      case "createAccount":
        // Call createAccount function from hook
        const bank = formData["bank name"];
        // const balance = formData["current balance"];

        createAccount(bank);
        setTimeout(fetchFunc(), 500);
        break;
      default:
        console.log("error, form submit not working");
        break;
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={submitAccountCreation}>
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

export default CreateAccountForm;
