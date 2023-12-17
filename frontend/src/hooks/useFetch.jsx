import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useAuthDispatch } from "../context/AuthContext";

const useFetch = () => {
  const user = useAuth();
  const token = user?.token;

  const dispatch = useAuthDispatch();

  axios.defaults.xsrfCookieName = "csrftoken";
  axios.defaults.xsrfHeaderName = "X-CSRFToken";
  axios.defaults.withCredentials = true;

  // LATER I NEED TO ENV THE URLS !!!
  const client = axios.create({
    baseURL: "http://127.0.0.1:8000",
  });

  // const API_TOKEN = import.meta.env.VITE_API_TOKEN;
  // const API_URL = import.meta.env.VITE_API_URL;
  // const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  // console.log(data);
  // console.log(client);

  useEffect(() => {
    setLoading(true);
    client
      .get("/api/get_user", {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then((res) => {
        const accountData = res.data.account;
        setData(res.data);
        setLoading(false);
        dispatch({
          type: "update account",
          account: accountData,
        });
      })
      .catch((error) => {
        console.log(error);
        setError(true);
        setLoading(false);
      });
  }, []);

  return { data, loading, error }; // Returning data, loading, and error states
};

export default useFetch;
