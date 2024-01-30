import React, { useState } from "react";
import "../../styles/Form.css";
import useCreateTransaction from "../../hooks/useCreateTransaction";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import getChoices from "../../hooks/getChoices";
import FormField from "./FormField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDeleteLeft,
  faRotate,
  faClose,
  faArrowLeftLong,
} from "@fortawesome/free-solid-svg-icons";

const CreateTransactionForm = ({
  fields,
  form,
  pay,
  transactionChange,
  fetchFunc,
}) => {
  // Import useCreateTransaction hook
  const { createTransaction } = useCreateTransaction();

  // Import getChoices hook
  const { data, loading, error } = getChoices();

  // Set initial state for form data
  let initialFieldStates = fields.reduce((acc, field) => {
    switch (field) {
      case "recurring":
        acc[field] = false;
        break;
      case "date":
      case "first_payment_date":
        acc[field] = new Date();
        break;
      case "category":
        acc[field] = "Utilities";
        break;
      default:
        // console.log(field);
        acc[field] = "";
    }

    return acc;
  }, {});

  // State to hold form data
  const [formData, setFormData] = useState({ ...initialFieldStates });
  // console.log(formData);

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
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: !prevFormData[fieldName],
    }));
  };

  // Handle form submission
  const submitTransCreation = (e) => {
    e.preventDefault();

    const formattedFormData = { ...formData };

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
        createTransaction(formattedFormData, pay); // Pass the entire formData object
        console.log("submitting");
        setTimeout(fetchFunc(), 500);
        setTimeout(transactionChange(null), 500);

        break;
      default:
        console.log("error, form submit not working");
        break;
    }
  };

  // Logic to hide recipient and category if pay == income
  const isIncome = pay === "income";

  return (
    <div className="form-container">
      <div className="back_btn_container">
        <button
          className="close_button"
          onClick={() => transactionChange("transactions")}
        >
          <FontAwesomeIcon
            className="close_button_icon"
            icon={faArrowLeftLong}
          />
        </button>
      </div>
      <form onSubmit={submitTransCreation}>
        {/* Map over form fields */}
        {fields.map((field, index) => (
          <div key={index} className="form-group">
            {(field === "recipient" || field === "category") &&
            isIncome ? null : (
              <>
                <label className="label">{field}</label>
                <FormField
                  field={field}
                  formData={formData}
                  handleChange={handleChange}
                  handleDateChange={handleDateChange}
                  handleChangeCheckbox={handleChangeCheckbox}
                  data={data}
                  key={index}
                />
              </>
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
