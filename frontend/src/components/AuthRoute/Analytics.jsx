import "../../App.css";

export default function Analytics(data) {
  let content = data?.data ?? null;
  let recipientArray = data?.data?.recipient_data ?? null;
  let categoryArray = data?.data?.category_data ?? null;
  console.log(categoryArray);
  return (
    <div className="ca_right">
      <h1 className="secondary_color">January breakdown</h1>
      <div className="analytics">
        <div className="topline">
          <div className="test">
            <p className="secondary_color">{`Total Income:`}</p>
            <span>{`- £${content?.income_total}`}</span>
          </div>
          <div className="test">
            <p className="secondary_color">{`Total Expenses:`}</p>
            <span>{`- £${content?.expense_total}`}</span>
          </div>
        </div>
        <div className="breakdown">
          <div className="category_container">
            <h1 className="secondary_color">Expenses by Category</h1>
            <div className="category_inner">
              {categoryArray &&
                categoryArray.map((category, index) => (
                  <div className="test" key={index}>
                    <p>{`${category.category__description}`}</p>
                    <p className="value">{`£${category.total_value}`}</p>
                  </div>
                ))}
            </div>
          </div>
          <div className="recipient_container">
            <h1 className="secondary_color">Expenses by recipients</h1>
            <div className="recipient_inner">
              {recipientArray &&
                recipientArray.map((recipient, index) => (
                  <div className="test" key={index}>
                    <p>{`${recipient.recipient__name}`}</p>
                    <p className="value">{`£${recipient.total_value}`}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
