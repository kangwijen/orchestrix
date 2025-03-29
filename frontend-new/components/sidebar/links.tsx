import {
  LucideIcon,
  LayoutDashboard,
  Package,
  Plus,
  Network,
  Database,
  HardDrive,
} from 'lucide-react';
import { title } from 'process';

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface NavItemWithSubItems extends NavItem {
  subItems: NavItem[];
}

export interface NavigationStructure {
  mainNavigation: NavGroup;
  containerManagement: {
    containers: NavItemWithSubItems;
    networks: NavItemWithSubItems;
    volumes: NavItemWithSubItems;
    otherItems: NavGroup;
  };
}

export const navigationLinks: NavigationStructure = {
  mainNavigation: {
    title: 'Navigation',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  containerManagement: {
    containers: {
      title: 'Container',
      url: '#',
      icon: Package,
      subItems: [
        {
          title: 'Manage',
          url: '/dashboard/containers/manage',
          icon: Package,
        },
        {
          title: 'Create',
          url: '/dashboard/containers/create',
          icon: Plus,
        },
      ],
    },
    networks: {
      title: 'Networks',
      url: '#',
      icon: Network,
      subItems: [
        {
          title: 'Manage',
          url: '/dashboard/networks/manage',
          icon: Network,
        },
        {
          title: 'Create',
          url: '/dashboard/networks/create',
          icon: Plus,
        },
      ],
    },
    volumes: {
      title: 'Volumes',
      url: '#',
      icon: Database,
      subItems: [
        {
          title: 'Manage',
          url: '/dashboard/volumes/manage',
          icon: Database,
        },
        {
          title: 'Create',
          url: '/dashboard/volumes/create',
          icon: Plus,
        },
      ],
    },
    otherItems: {
      title: 'Container Management',
      items: [
        {
          title: 'System',
          url: '/dashboard/system',
          icon: HardDrive,
        },
      ],
    },
  },
};
