import { Home, Container, LogOut } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
const navigationItems = [
    {
        title: "Home",
        url: "/dashboard",
        icon: Home,
    },
];

const dockerItems = [
    {
        title: "Docker",
        url: "/container/docker",
        icon: Container,
    },
];

export function AppSidebar() {
    const handleLogout = async () => {
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(
                    /=.*/,
                    "=;expires=" + new Date().toUTCString() + ";path=/",
                );
        });
        window.location.href = "/login";
    };

    return (
        <Sidebar className="p-2 sm:p-4">
            <SidebarHeader />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-sm sm:text-base">
                        Navigation
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigationItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a
                                            href={item.url}
                                            className="flex items-center gap-2 p-2 sm:p-3"
                                        >
                                            <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                            <span className="text-sm sm:text-base">
                                                {item.title}
                                            </span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-sm sm:text-base">
                        Container Management
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {dockerItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a
                                            href={item.url}
                                            className="flex items-center gap-2 p-2 sm:p-3"
                                        >
                                            <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                            <span className="text-sm sm:text-base">
                                                {item.title}
                                            </span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-2 sm:p-3">
                <SidebarMenuButton
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 p-2 sm:p-3 text-red-500 hover:bg-red-500/10 rounded-md"
                >
                    <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">Logout</span>
                </SidebarMenuButton>
            </SidebarFooter>
        </Sidebar>
    );
}
