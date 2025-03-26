'use client';

import {
  Boxes,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { authApi } from '@/lib/api';
import { navigationLinks } from './links';

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await authApi.logout();
  };

  return (
    <Sidebar className={isMobile ? "text-base" : ""}>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 p-4 mx-auto">
          <Boxes className="h-6 w-6" />
          <span className="text-xl font-bold">Orchestrix</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm md:text-xs">
            {navigationLinks.mainNavigation.title}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationLinks.mainNavigation.items.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className="py-2.5 md:py-2"
                  >
                    <Link href={item.url} onClick={handleLinkClick}>
                      <item.icon className="h-5 w-5 md:h-4 md:w-4" />
                      <span className="text-base md:text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm md:text-xs">
            {navigationLinks.containerManagement.otherItems.title}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Collapsible defaultOpen className="group/containerCollapsible w-full">
                  <CollapsibleTrigger className="flex w-full items-center px-3 py-2.5 md:py-2 hover:bg-accent hover:text-accent-foreground rounded-md">
                    <navigationLinks.containerManagement.containers.icon className="h-5 w-5 md:h-4 md:w-4 mr-2" />
                    <span className="text-base md:text-sm">{navigationLinks.containerManagement.containers.title}</span>
                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/containerCollapsible:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pl-6 mt-1 space-y-1">
                      {navigationLinks.containerManagement.containers.subItems.map(subItem => (
                        <SidebarMenuButton
                          key={subItem.title}
                          asChild
                          isActive={pathname === subItem.url}
                          tooltip={subItem.title}
                          className="w-full py-2.5 md:py-2"
                        >
                          <Link href={subItem.url} onClick={handleLinkClick}>
                            <subItem.icon className="h-5 w-5 md:h-4 md:w-4" />
                            <span className="text-base md:text-sm">{subItem.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
              
              {navigationLinks.containerManagement.otherItems.items.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className="py-2.5 md:py-2"
                  >
                    <Link href={item.url} onClick={handleLinkClick}>
                      <item.icon className="h-5 w-5 md:h-4 md:w-4" />
                      <span className="text-base md:text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-3">
        <SidebarMenuButton
          onClick={handleLogout}
          className="w-full flex items-center gap-2 p-3 text-red-500 hover:bg-red-500/10 rounded-md"
        >
          <LogOut className="h-5 w-5 md:h-4 md:w-4" />
          <span className="text-base md:text-sm">Logout</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
