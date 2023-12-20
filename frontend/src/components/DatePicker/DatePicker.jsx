import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MyDatePicker = () => {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const formatDate = (date) => {
    if (!date) return ""; // Handle cases when date is null or undefined
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "4-digit",
      month: "2-digit",
      day: "2-digit",
    });
    return formattedDate;
  };

  return (
    <div>
      <label>Select a date:</label>
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        dateFormat="MM-dd-yy"
        placeholderText="MM-DD-YY"
      />
      {/* <p>Selected Date: {formatDate(selectedDate)}</p> */}
    </div>
  );
};

export default MyDatePicker;
