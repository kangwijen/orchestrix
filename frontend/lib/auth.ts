import Cookies from "js-cookie";

export function isAuthenticated() {
    const token = Cookies.get("accessToken");
    return !!token;
}
