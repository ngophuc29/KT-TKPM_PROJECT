import { Navigate } from "react-router-dom";

export function PrivateRoute({ children }) {
    const token = localStorage.getItem("accessToken");
    return token ? children : <Navigate to="/login" replace />;
}

export function PublicRoute({ children }) {
    const token = localStorage.getItem("accessToken");
    return token ? <Navigate to="/overview" replace /> : children;
}