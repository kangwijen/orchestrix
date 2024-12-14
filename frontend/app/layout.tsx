"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { metadata } from "./metadata";
import { usePathname } from "next/navigation";
import "./globals.css";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <title>{metadata.title?.toString()}</title>
            </head>
            <body>
                <ThemeProvider attribute="class" defaultTheme="dark">
                    <SidebarProvider>
                        <div className="group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar">
                            <AppSidebar />
                            <main className="flex-1">
                                {pathname !== "/login" && <SidebarTrigger />}
                                {children}
                                <Toaster />
                            </main>
                        </div>
                    </SidebarProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
