import { Navigate, Outlet } from "react-router-dom";
import { isAdminUser } from "../utils/auth.js";

export default function AdminRouter({ redirectTo = '/' }) {
    return isAdminUser() ? <Outlet /> : <Navigate to={redirectTo} replace />;
}
