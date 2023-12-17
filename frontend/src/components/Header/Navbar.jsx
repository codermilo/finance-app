import { useAuth, useAuthDispatch } from "../../context/AuthContext";
import "../../styles/Navbar.css";
import axios from "axios";

export default function Navbar(props) {
  axios.defaults.xsrfCookieName = "csrftoken";
  axios.defaults.xsrfHeaderName = "X-CSRFToken";
  axios.defaults.withCredentials = true;

  const client = axios.create({
    baseURL: "http://127.0.0.1:8000",
  });

  // function to change the form options
  const openform = props.loginRegFunc;

  // importing auth status from context
  const authStatus = useAuth();
  const token = authStatus.token;

  // importing dispatch so I can send them to my authcontext
  const dispatch = useAuthDispatch();

  const logoutDispatch = (e) => {
    e.preventDefault();

    // Assuming 'token' holds the user's authentication token
    client
      .post(
        "/api/logout",
        {},
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      )
      .then(function (res) {
        console.log("Logging out.");
        dispatch({
          type: "logout",
        });
      })
      .catch(function (error) {
        console.error("Error during logout:", error);
      });
  };

  return (
    <div className="Navbar">
      <div className="logo">
        <h1>Logo</h1>
      </div>

      {authStatus.isLoggedIn ? (
        <div className="login__buttons">
          <div className="navbar__btn">
            <button onClick={logoutDispatch}>Logout</button>
          </div>
        </div>
      ) : (
        <div className="login__buttons">
          <div className="navbar__btn">
            <button onClick={() => openform("login")}>Login</button>
          </div>
          <div className="navbar__btn">
            <button onClick={() => openform("register")}>Register</button>
          </div>
        </div>
      )}
    </div>
  );
}
