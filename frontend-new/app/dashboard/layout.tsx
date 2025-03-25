import React from 'react';
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { UserAvatarMenu } from '@/components/user-avatar-menu';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-w-screen min-h-screen flex-col md:flex-row">
        {/* Mobile Header */}
        <header className="bg-background sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4 md:hidden">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <span className="text-xl font-bold">Orchestrix</span>
          </div>
          <UserAvatarMenu />
        </header>

        {/* Sidebar for desktop */}
        <div className="hidden md:block">
          <AppSidebar />
          <SidebarRail />
        </div>

        <div className="flex flex-1 flex-col">
          {/* Desktop Header */}
          <header className="bg-background sticky top-0 z-30 hidden h-14 items-center justify-between border-b px-4 md:flex">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
            </div>
            <div className="flex items-center gap-4">
              <UserAvatarMenu />
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
