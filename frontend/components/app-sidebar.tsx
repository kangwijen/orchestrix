import {
    Home,
    Container,
    LogOut,
    Plus,
    Settings,
    ChevronDown,
    Network,
    Database,
} from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
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

import { usePathname } from "next/navigation";

const navigationItems = [
    {
        title: "Home",
        url: "/dashboard",
        icon: Home,
    },
];

const dockerItems = {
    title: "Docker",
    icon: Container,
    subItems: [
        {
            title: "Manage Containers",
            url: "/docker/container/manage",
            icon: Settings,
        },
        {
            title: "Create Container",
            url: "/docker/container/create",
            icon: Plus,
        },
        {
            title: "Manage Networks",
            url: "/docker/network/manage",
            icon: Network,
        },
        {
            title: "Manage Volumes",
            url: "/docker/volume/manage",
            icon: Database,
        },
    ],
};

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

    const pathname = usePathname();

    if (pathname === "/login") return null;

    return (
        <Sidebar>
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
                            <Collapsible>
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton className="flex items-center gap-2 p-2 sm:p-3 group">
                                            <dockerItems.icon />
                                            <span className="text-sm sm:text-base">
                                                {dockerItems.title}
                                            </span>
                                            <ChevronDown className="ml-auto transition-transform data-[state=open]:rotate-180" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenu className="ml-2">
                                            {dockerItems.subItems.map(
                                                (item) => (
                                                    <SidebarMenuItem
                                                        key={item.title}
                                                    >
                                                        <SidebarMenuButton
                                                            asChild
                                                        >
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
                                                ),
                                            )}
                                        </SidebarMenu>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
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
