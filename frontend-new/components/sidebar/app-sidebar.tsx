'use client';

import { Boxes, LogOut, ChevronDown } from 'lucide-react';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
    <Sidebar className={isMobile ? 'text-base' : ''}>
      <SidebarHeader>
        <Link href="/dashboard" className="mx-auto flex items-center gap-2 p-4">
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
              {/* Containers Collapsible */}
              <SidebarMenuItem>
                <Collapsible
                  defaultOpen
                  className="group/containerCollapsible w-full"
                >
                  <CollapsibleTrigger className="hover:bg-accent hover:text-accent-foreground flex w-full items-center rounded-md px-3 py-2.5 md:py-2">
                    <navigationLinks.containerManagement.containers.icon className="mr-2 h-5 w-5 md:h-4 md:w-4" />
                    <span className="text-base md:text-sm">
                      {navigationLinks.containerManagement.containers.title}
                    </span>
                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/containerCollapsible:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-1 space-y-1 pl-6">
                      {navigationLinks.containerManagement.containers.subItems.map(
                        subItem => (
                          <SidebarMenuButton
                            key={subItem.title}
                            asChild
                            isActive={pathname === subItem.url}
                            tooltip={subItem.title}
                            className="w-full py-2.5 md:py-2"
                          >
                            <Link href={subItem.url} onClick={handleLinkClick}>
                              <subItem.icon className="h-5 w-5 md:h-4 md:w-4" />
                              <span className="text-base md:text-sm">
                                {subItem.title}
                              </span>
                            </Link>
                          </SidebarMenuButton>
                        ),
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Collapsible
                  defaultOpen
                  className="group/networksCollapsible w-full"
                >
                  <CollapsibleTrigger className="hover:bg-accent hover:text-accent-foreground flex w-full items-center rounded-md px-3 py-2.5 md:py-2">
                    <navigationLinks.containerManagement.networks.icon className="mr-2 h-5 w-5 md:h-4 md:w-4" />
                    <span className="text-base md:text-sm">
                      {navigationLinks.containerManagement.networks.title}
                    </span>
                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/networksCollapsible:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-1 space-y-1 pl-6">
                      {navigationLinks.containerManagement.networks.subItems.map(
                        subItem => (
                          <SidebarMenuButton
                            key={subItem.title}
                            asChild
                            isActive={pathname === subItem.url}
                            tooltip={subItem.title}
                            className="w-full py-2.5 md:py-2"
                          >
                            <Link href={subItem.url} onClick={handleLinkClick}>
                              <subItem.icon className="h-5 w-5 md:h-4 md:w-4" />
                              <span className="text-base md:text-sm">
                                {subItem.title}
                              </span>
                            </Link>
                          </SidebarMenuButton>
                        ),
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Collapsible
                  defaultOpen
                  className="group/volumesCollapsible w-full"
                >
                  <CollapsibleTrigger className="hover:bg-accent hover:text-accent-foreground flex w-full items-center rounded-md px-3 py-2.5 md:py-2">
                    <navigationLinks.containerManagement.volumes.icon className="mr-2 h-5 w-5 md:h-4 md:w-4" />
                    <span className="text-base md:text-sm">
                      {navigationLinks.containerManagement.volumes.title}
                    </span>
                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/volumesCollapsible:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-1 space-y-1 pl-6">
                      {navigationLinks.containerManagement.volumes.subItems.map(
                        subItem => (
                          <SidebarMenuButton
                            key={subItem.title}
                            asChild
                            isActive={pathname === subItem.url}
                            tooltip={subItem.title}
                            className="w-full py-2.5 md:py-2"
                          >
                            <Link href={subItem.url} onClick={handleLinkClick}>
                              <subItem.icon className="h-5 w-5 md:h-4 md:w-4" />
                              <span className="text-base md:text-sm">
                                {subItem.title}
                              </span>
                            </Link>
                          </SidebarMenuButton>
                        ),
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>

              {navigationLinks.containerManagement.otherItems.items.map(
                item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                      className="py-2.5 md:py-2"
                    >
                      <Link href={item.url} onClick={handleLinkClick}>
                        <item.icon className="h-5 w-5 md:h-4 md:w-4" />
                        <span className="text-base md:text-sm">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenuButton
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md p-3 text-red-500 hover:bg-red-500/10"
        >
          <LogOut className="h-5 w-5 md:h-4 md:w-4" />
          <span className="text-base md:text-sm">Logout</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
