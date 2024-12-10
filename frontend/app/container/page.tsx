"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function ContainerPage() {
    useEffect(() => {
        if (!isAuthenticated()) {
            redirect("/login");
        } else {
            redirect("/dashboard");
        }
    }, []);

    return null;
}
