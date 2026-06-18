import {Navigate, Outlet} from "react-router-dom";
import {isAuthenticated} from "../utils/auth.js";

export default function PrivateRouter({redirectTo = '/login'}) {
    return isAuthenticated() ? <Outlet /> : <Navigate to={redirectTo} replace/>;
}
    