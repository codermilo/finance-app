const formateDate = (dateString) => {
  const formattedDate = new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return formattedDate;
};

export default formateDate;
