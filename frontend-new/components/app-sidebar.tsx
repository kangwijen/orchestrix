'use client';

import {
  Boxes,
  LayoutDashboard,
  Database,
  Settings,
  Package,
  Network,
  HardDrive,
  LogOut,
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
} from '@/components/ui/sidebar';

const items = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Containers',
    url: '/dashboard/containers',
    icon: Package,
  },
  {
    title: 'Networks',
    url: '/dashboard/networks',
    icon: Network,
  },
  {
    title: 'Volumes',
    url: '/dashboard/volumes',
    icon: Database,
  },
  {
    title: 'System',
    url: '/dashboard/system',
    icon: HardDrive,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar>
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="mx-auto flex items-center gap-2">
          <Boxes className="h-6 w-6" />
          <span className="text-lg font-bold">Orchestrix</span>
        </Link>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url} onClick={handleLinkClick}>
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto border-t p-4">
        <Link
          href="/logout"
          className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm"
          onClick={handleLinkClick}
        >
          <LogOut size={18} />
          <span>Log out</span>
        </Link>
      </div>
    </Sidebar>
  );
}
