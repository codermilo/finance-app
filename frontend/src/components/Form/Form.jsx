import React, { useState } from "react";
import "../../styles/Form.css"; // Import the CSS file
import { useAuthDispatch } from "../../context/AuthContext";
import useRegister from "../../hooks/useRegister";
import useLogin from "../../hooks/useLogin";
import useCreateTransaction from "../../hooks/useCreateTransaction";

const Form = ({ fields, form }) => {
  // importing dispatch so I can send them to my authcontext
  const dispatch = useAuthDispatch();

  // import useRegister
  const { registerUser } = useRegister();
  const { loginUser } = useLogin();
  const { createTransaction } = useCreateTransaction();

  const initialFieldStates = fields.reduce((acc, field) => {
    acc[field] = "";
    return acc;
  }, {});

  const [formData, setFormData] = useState({ ...initialFieldStates });
  const { email, username, password } = formData;

  const handleChange = (e, fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: e.target.value,
    });
  };

  const submitRegistration = (e) => {
    e.preventDefault();
    // Handle form submission logic with formData object
    console.log(formData);

    switch (form) {
      case "register":
        registerUser(email, username, password);
        break;
      case "login":
        loginUser(username, password);
        break;
      // case "createTransaction":
      //   createTransaction();
      //   break;
      default:
        // Handle default case if needed
        break;
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={submitRegistration}>
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
};

export default Form;
