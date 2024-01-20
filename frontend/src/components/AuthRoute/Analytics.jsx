import "../../App.css";
import { useAuth } from "../../context/AuthContext";

export default function Analytics() {
  // importing data from auth state
  const user = useAuth();
  let recipientArray = user.analytics.recipient_data ?? null;
  let categoryArray = user.analytics.category_data ?? null;

  let content = user.analytics ?? null;
  // let recipientArray = data?.data?.recipient_data ?? null;
  // let categoryArray = data?.data?.category_data ?? null;
  return (
    <div className="ca_right">
      <h1>Analytics</h1>
      <div className="analytics">
        <div className="topline">
          <div className="test">
            <p>{`Total Income: £${content?.income_total}`}</p>
          </div>
          <div className="test">
            <p>{`Total Expenses: £${content?.expense_total}`}</p>
          </div>
        </div>
        <div className="breakdown">
          <div className="recipient_container">
            <h1>Expenses by recipients</h1>
            <div className="recipient_inner">
              {recipientArray &&
                recipientArray.map((recipient, index) => (
                  <div className="test" key={index}>
                    <p>{`${recipient.recipient__name}`}</p>
                    <p>{`£${recipient.total_value}`}</p>
                  </div>
                ))}
            </div>
          </div>
          <div className="category_container">
            <h1>Expenses by Category</h1>
            <div className="category_inner">
              {categoryArray &&
                categoryArray.map((category, index) => (
                  <div className="test" key={index}>
                    <p>{`${category.category__description}`}</p>
                    <p>{`£${category.total_value}`}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
