import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const FormField = ({
  field,
  formData,
  handleChange,
  handleDateChange,
  handleChangeCheckbox,
  data,
}) => {
  switch (field) {
    case "recurring":
      return (
        <input
          type="checkbox"
          checked={formData[field]}
          onChange={(e) => handleChangeCheckbox(e, field)}
          className="checkbox"
        />
      );
    case "recipient":
      return (
        <>
          <select
            value={formData[field]}
            onChange={(e) => handleChange(e, field)}
            className="select"
          >
            <option value="">Select recipient</option>
            {data?.recipients.map((recipient) => (
              <option key={recipient.id} value={recipient.name}>
                {recipient.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Or enter recipient"
            value={formData[field]}
            onChange={(e) => handleChange(e, field)}
            className="input"
          />
        </>
      );
    case "category":
      return (
        <select
          value={formData[field]}
          onChange={(e) => handleChange(e, field)}
          className="select"
        >
          {/* <option value="">Select category</option> */}
          {data?.category_choices?.map((category) => (
            <option key={category.id} value={category}>
              {category}
            </option>
          ))}
        </select>
      );
    case "first_payment_date":
      return (
        <DatePicker
          selected={formData[field] || new Date()}
          onChange={(date) => handleDateChange(date, field)}
          dateFormat="MM-dd-yy"
          placeholderText="MM-DD-YY"
          className="input"
        />
      );
    case "final_payment_date":
    case "previous_payment_date":
      return (
        <DatePicker
          selected={formData[field]}
          onChange={(date) => handleDateChange(date, field)}
          dateFormat="MM-dd-yy"
          placeholderText="MM-DD-YY"
          className="input"
        />
      );
    default:
      return (
        <input
          type={field === "password" ? "password" : "text"}
          placeholder={`Enter ${field}`}
          value={formData[field]}
          onChange={(e) => handleChange(e, field)}
          className="input"
        />
      );
  }
};

export default FormField;
