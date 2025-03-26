import React from 'react';
import { SidebarProvider, SidebarRail } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { AppHeader } from '@/components/header/app-header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen min-w-screen flex-col md:flex-row">
        {/* Mobile Header */}
        <div className="md:hidden">
          <AppHeader isMobile={true} />
        </div>

        {/* Sidebar for desktop */}
        <div className="hidden md:block">
          <AppSidebar />
          <SidebarRail />
        </div>

        <div className="flex flex-1 flex-col">
          {/* Desktop Header */}
          <div className="hidden md:block">
            <AppHeader />
          </div>

          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
