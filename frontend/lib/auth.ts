import Cookies from "js-cookie";

export function isAuthenticated() {
    const token = Cookies.get("accessToken");

    if (!token) {
        return Promise.resolve(false);
    }

    return fetch(
        `${process.env.NEXT_PUBLIC_FLASK_PROTOCOL}://${process.env.NEXT_PUBLIC_FLASK_HOST}:${process.env.NEXT_PUBLIC_FLASK_PORT}/api/user`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    )
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            return false;
        })
        .then((data) => !!data)
        .catch((error) => {
            return !!token;
        });
}
