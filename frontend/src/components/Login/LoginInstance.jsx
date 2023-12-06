import { useAuth, useAuthDispatch } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";

export default function LoginInstance() {

    // const authStatus = useAuth();
    // const dispatch = useAuthDispatch();

    const { data, loading, error } = useFetch();

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error occurred while fetching data.</p>;
    }

    if (data) {
        return <p>User Data: {JSON.stringify(data)}</p>;
    }

    return null;
}

