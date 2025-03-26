import { LucideIcon, LayoutDashboard, Package, Plus, Network, Database, HardDrive } from 'lucide-react';

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
    otherItems: NavGroup;
  };
}

export const navigationLinks: NavigationStructure = {
  mainNavigation: {
    title: "Navigation",
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
      },
    ]
  },
  containerManagement: {
    containers: {
      title: 'Container',
      url: '#',
      icon: Package,
      subItems: [
        {
          title: 'Manage',
          url: '/dashboard/containers',
          icon: Package,
        },
        {
          title: 'Create',
          url: '/dashboard/containers/new',
          icon: Plus,
        }
      ]
    },
    otherItems: {
      title: "Container Management",
      items: [
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
      ]
    }
  }
};
