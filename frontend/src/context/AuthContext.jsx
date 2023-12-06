import { createContext, useContext, useReducer, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";

// Create contexts for authentication state and dispatch function
const AuthContext = createContext(null);
const AuthDispatchContext = createContext(null);

export function AuthProvider({ children }) {
  // Define initial authentication state
  const initialAuth = {
    isLoggedIn: false,
    user: null,
    error: null,
  };

  // Use reducer to manage authentication state changes
  const [auth, dispatch] = useReducer(authReducer, initialAuth);

  // Load Auth from cookies when component mounts
  useEffect(() => {
    const fetchData = async () => {
      let savedCredentials;
      const savedCredString = Cookies.get("auth");

      try {
        savedCredentials = savedCredString
          ? JSON.parse(savedCredString)
          : initialAuth;
      } catch (error) {
        console.error("Error parsing saved auth:", error);
        Cookies.remove("auth");
        savedCredentials = initialAuth;
      }

      if (!savedCredentials.auth) {
        axios.defaults.xsrfCookieName = "csrftoken";
        axios.defaults.xsrfHeaderName = "X-CSRFToken";
        axios.defaults.withCredentials = true;

        // LATER I NEED TO ENV THE URLS !!!
        const client = axios.create({
          baseURL: "http://127.0.0.1:8000",
        });

        try {
          client
            .get("/api/user")
            .then((res) => {
              // console.log(res.data.user);
              dispatch({
                type: "login",
                isLoggedIn: true,
                user: res.data.user,
              });
            })
            .catch((error) => {
              console.log(error);
            });
        } catch (error) {
          console.error("Error fetching data:", error);
          // Handle error if needed
          dispatch({
            type: "setError",
            error: error,
          });
        }
      } else {
        dispatch({ type: "initialize", auth: savedCredentials });
      }
    };

    fetchData();
  }, []);

  // Save auth to cookies whenever it changes
  useEffect(() => {
    const authString = JSON.stringify(auth);
    Cookies.set("auth", authString);
    const authCookieSize = getCookieSize("auth");
    console.log(`Size of auth cookie: ${authCookieSize} bytes`);
  }, [auth]);

  function getCookieSize(cookieName) {
    const cookieValue = Cookies.get(cookieName);

    if (!cookieValue) {
      return 0;
    }

    // Encode string to UTF-8 and measure its length in bytes
    const size = new Blob([cookieValue], { type: "text/plain" }).size;

    return size;
  }

  // Provide authentication state to child components
  return (
    <AuthContext.Provider value={auth}>
      {/* Provide authentication dispatch function to child components */}
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthContext.Provider>
  );
}

// Custom hook to access the authentication state
export function useAuth() {
  return useContext(AuthContext);
}

// Custom hook to access the authentication dispatch function
export function useAuthDispatch() {
  return useContext(AuthDispatchContext);
}

// Reducer function to manage authentication state changes
function authReducer(state, action) {
  switch (action.type) {
    case "initialize":
      return action.auth;

    case "login":
      return {
        ...state,
        isLoggedIn: true,
        user: action.user,
        error: null,
      };

    case "logout":
      return {
        ...state,
        isLoggedIn: false,
        user: null,
        error: null,
      };

    case "register":
      return {
        ...state,
        isLoggedIn: true,
        user: action.user,
        error: null,
      };

    case "setError":
      return {
        ...state,
        error: action.error,
      };

    default:
      throw new Error("Unknown action: " + action.type);
  }
}
