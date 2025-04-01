'use client';

import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserAvatarMenu } from '@/components/header/user-avatar-menu';

interface AppHeaderProps {
  isMobile?: boolean;
}

export function AppHeader({ isMobile = false }: AppHeaderProps) {
  return (
    <header
      className={`bg-background sticky top-0 z-30 flex items-center justify-between border-b px-6 ${isMobile ? 'h-16' : 'h-16'}`}
    >
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        {isMobile && <span className="text-xl font-bold">Orchestrix</span>}
      </div>
      <div className="flex items-center gap-4">
        <UserAvatarMenu />
      </div>
    </header>
  );
}
