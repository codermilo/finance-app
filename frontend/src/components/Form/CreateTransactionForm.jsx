import React, { useState } from "react";
import "../../styles/Form.css";
import useCreateTransaction from "../../hooks/useCreateTransaction";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import getChoices from "../../hooks/getChoices";
import FormField from "./FormField";

const CreateTransactionForm = ({ fields, form }) => {
  // Import useCreateTransaction hook
  const { createTransaction } = useCreateTransaction();

  // Import getChoices hook
  const { data, loading, error } = getChoices();
  // console.log(data.category_choices[0]);
  // console.log(data.recipients[0].name);

  // Set initial state for form data
  const initialFieldStates = fields.reduce((acc, field) => {
    switch (field) {
      case "recurring":
        acc[field] = false;
        break;
      case "first_payment_date":
        acc[field] = new Date();
        break;
      case "category":
        acc[field] = "Utilities";
        break;
      default:
        console.log(field);
        acc[field] = "";
    }

    return acc;
  }, {});

  // State to hold form data
  const [formData, setFormData] = useState({ ...initialFieldStates });
  console.log(formData);

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

  // Handle changes in checkbox input fields
  const handleChangeCheckbox = (e, fieldName) => {
    const isChecked = e.target.checked;
    setFormData({
      ...formData,
      [fieldName]: isChecked, // Update the state with a boolean value
    });
  };

  // Handle form submission
  const submitTransCreation = (e) => {
    e.preventDefault();

    const formattedFormData = { ...formData };

    // console.log(formData);
    // console.log(formattedFormData);

    // Convert date strings to Date objects
    Object.keys(formattedFormData).forEach((field) => {
      if (
        field.includes("date") &&
        typeof formattedFormData[field] === "string" &&
        formattedFormData[field].trim() !== ""
      ) {
        formattedFormData[field] = new Date(formattedFormData[field]);
      } else if (formattedFormData[field] === "") {
        formattedFormData[field] = null; // Set empty date values to null
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

  // Function to determine if a field should be shown based on 'recurring' value
  const shouldShowField = (fieldName) => {
    if (fieldName === "recurring") {
      return true; // Always show 'recurring' field
    }
    return (
      formData.recurring ||
      ![
        "recurring_period",
        // "first_payment_date",
        "final_payment_date",
        "previous_payment_date",
      ].includes(fieldName)
    );
  };

  return (
    <div className="form-container">
      <form onSubmit={submitTransCreation}>
        {/* Map over form fields */}
        {fields.map(
          (field) =>
            shouldShowField(field) && (
              <div key={field} className="form-group">
                <label className="label">{field}</label>
                <FormField
                  field={field}
                  formData={formData}
                  handleChange={handleChange}
                  handleDateChange={handleDateChange}
                  handleChangeCheckbox={handleChangeCheckbox}
                  data={data}
                />
              </div>
            )
        )}

        {/* Submit button */}
        <button type="submit" className="button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default CreateTransactionForm;
