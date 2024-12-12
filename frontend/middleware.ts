import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("accessToken")?.value;
    const isLoginPage = request.nextUrl.pathname === "/login";
    const isRootPage = request.nextUrl.pathname === "/";

    if (isLoginPage || isRootPage) {
        if (token) {
            const response = await fetch("http://localhost:5000/api/user", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                return NextResponse.redirect(
                    new URL("/dashboard", request.nextUrl),
                );
            }
        }
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.nextUrl));
    }

    const response = await fetch("http://localhost:5000/api/user", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        return NextResponse.redirect(new URL("/login", request.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/", "/login", "/dashboard/:path*", "/container/:path*"],
};
