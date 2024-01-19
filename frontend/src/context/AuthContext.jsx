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
    username: null,
    email: null,
    token: null,
    account: null,
    error: null,
  };

  // Use reducer to manage authentication state changes
  const [auth, dispatch] = useReducer(authReducer, initialAuth);

  // Load Auth from cookies when component mounts
  useEffect(() => {
    const fetchData = async () => {
      let savedCredentials;
      const savedCredString = Cookies.get("auth");
      // console.log("Getting auth from cookie. This is what there is");
      // console.log(savedCredString);

      try {
        savedCredentials = savedCredString
          ? JSON.parse(savedCredString)
          : initialAuth;
      } catch (error) {
        console.error("Error parsing saved auth:", error);
        Cookies.remove("auth");
        savedCredentials = initialAuth;
      }

      dispatch({ type: "initialize", auth: savedCredentials });
    };

    fetchData();
  }, []);

  // Save auth to cookies whenever it changes
  useEffect(() => {
    const authString = JSON.stringify(auth);
    Cookies.set("auth", authString);
    const authCookieSize = getCookieSize("auth");
    // console.log("saving auth to cookie");
    // console.log(Cookies.get("auth"));
    // console.log(`Size of auth cookie: ${authCookieSize} bytes`);
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
        username: action.username,
        userId: action.userId,
        token: action.token,
        account: action.account,
        error: null,
      };

    case "logout":
      return {
        ...state,
        isLoggedIn: false,
        username: null,
        userId: null,
        email: null,
        token: null,
        account: null,
        error: null,
      };

    case "register":
      return {
        ...state,
        isLoggedIn: true,
        username: action.username,
        email: action.email,
        error: null,
      };

    case "update account":
      return {
        ...state,
        account: action.account,
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
