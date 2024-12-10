"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated()) {
            router.push("/dashboard");
        } else {
            router.push("/login");
        }
    }, [router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card>
                <CardContent className="flex items-center gap-2 p-6">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Loading...</p>
                </CardContent>
            </Card>
        </div>
    );
}
