import React, { useState } from "react";
import "../../styles/Form.css";
import useCreateTransaction from "../../hooks/useCreateTransaction";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CreateTransactionForm = ({ fields, form }) => {
  // Import useCreateTransaction hook
  const { createTransaction } = useCreateTransaction();

  // Set initial state for form data
  const initialFieldStates = fields.reduce((acc, field) => {
    acc[field] = "";
    return acc;
  }, {});

  // State to hold form data
  const [formData, setFormData] = useState({ ...initialFieldStates });

  // Handle date changes for date pickers
  const handleDateChange = (date, fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: date,
    });
  };

  // Handle changes in non-date input fields
  const handleChange = (e, fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: e.target.value,
    });
  };

  // Handle form submission
  const submitTransCreation = (e) => {
    e.preventDefault();

    const formattedFormData = { ...formData };

    console.log(formData);
    console.log(formattedFormData);

    // Convert date strings to Date objects
    Object.keys(formattedFormData).forEach((field) => {
      if (
        field.includes("date") &&
        typeof formattedFormData[field] === "string"
      ) {
        formattedFormData[field] = new Date(formattedFormData[field]);
      }
    });

    // Format Date objects to YYYY-MM-DD format
    Object.keys(formattedFormData).forEach((field) => {
      if (formattedFormData[field] instanceof Date) {
        formattedFormData[field] = formattedFormData[field]
          .toISOString()
          .split("T")[0];
      }
    });

    // Switch based on form type
    switch (form) {
      case "createTransaction":
        // Call createTransaction function from hook
        createTransaction(formattedFormData); // Pass the entire formData object
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
            {/* Check if the field is a date field */}
            {field.includes("date") ? (
              <DatePicker
                selected={formData[field]}
                onChange={(date) => handleDateChange(date, field)}
                dateFormat="MM-dd-yy"
                placeholderText="MM-DD-YY"
                className="input"
              />
            ) : (
              <input
                type={field === "password" ? "password" : "text"}
                placeholder={`Enter ${field}`}
                value={formData[field]}
                onChange={(e) => handleChange(e, field)}
                className="input"
              />
            )}
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
