"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { isAuthenticated } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { Card, CardContent } from "@/components/ui/card";
import "./globals.css";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthed, setIsAuthed] = useState(false);

    useEffect(() => {
        setIsAuthed(isAuthenticated());
        setIsLoading(false);
    }, []);

    return (
        <html lang="en" suppressHydrationWarning>
            <head />
            <body>
                <ThemeProvider attribute="class" defaultTheme="dark">
                    {isLoading ? (
                        <div className="flex min-h-screen items-center justify-center">
                            <Card>
                                <CardContent className="flex items-center gap-2 p-6">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                    <p>Loading...</p>
                                </CardContent>
                            </Card>
                        </div>
                    ) : isAuthed ? (
                        <SidebarProvider>
                            <div className="group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar">
                                <AppSidebar />
                                <main className="flex-1">
                                    <SidebarTrigger />
                                    {children}
                                    <Toaster />
                                </main>
                            </div>
                        </SidebarProvider>
                    ) : (
                        <main>
                            {children}
                            <Toaster />
                        </main>
                    )}
                </ThemeProvider>
            </body>
        </html>
    );
}
