import React, { useState } from "react";
import useUpdateAccount from "../../hooks/useUpdateAccount";
import useFetch from "../../hooks/useFetch";

export default function UpdateAccountForm({ fields, showForm }) {
  const { updateAccount } = useUpdateAccount();
  const { fetchData } = useFetch();

  // Handle incoming fields
  const initialFieldStates = fields.reduce((acc, field) => {
    acc[field] = "";
    return acc;
  }, {});

  // Hold form data
  const [formData, setFormData] = useState({ ...initialFieldStates });

  // Function to change form
  const handleChange = (e, fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: e.target.value,
    });
  };

  // Handle form submission
  const submitAccountChange = (e) => {
    e.preventDefault();
    updateAccount(formData);
    setTimeout(fetchData(), 500);
    setTimeout(showForm(false), 600);
  };

  return (
    <div className="form-container">
      <form onSubmit={submitAccountChange}>
        {fields.map((field) => (
          <div key={field} className="form-group">
            <label className="label">{field}</label>
            <input
              type={field === "password" ? "password" : "text"}
              placeholder={`Enter ${field}`}
              value={formData[field] || ""}
              onChange={(e) => handleChange(e, field)}
              className="input"
            />
          </div>
        ))}
        <button type="submit" className="button">
          Submit
        </button>
      </form>
    </div>
  );
}
