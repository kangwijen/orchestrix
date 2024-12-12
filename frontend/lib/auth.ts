import Cookies from "js-cookie";

export function isAuthenticated() {
    const token = Cookies.get("accessToken");

    if (!token) {
        return Promise.resolve(false);
    }

    return fetch("http://localhost:5000/api/user", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            return false;
        })
        .then((data) => !!data)
        .catch((error) => {
            console.error("Failed to fetch user data:", error);
            return !!token;
        });
}
