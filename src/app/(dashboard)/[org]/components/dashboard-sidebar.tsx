/**
 * Dashboard Sidebar
 *
 * Navegação lateral da dashboard da organização
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  MessageSquare,
  Workflow,
  Settings,
  Link as LinkIcon,
  Users,
  BarChart3,
} from 'lucide-react';

interface DashboardSidebarProps {
  organizationSlug: string;
  organizationName: string;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Inbox',
    href: '/inbox',
    icon: MessageSquare,
  },
  {
    name: 'Conexões',
    href: '/connections',
    icon: LinkIcon,
  },
  {
    name: 'Workflows',
    href: '/workflows',
    icon: Workflow,
  },
  {
    name: 'Equipe',
    href: '/team',
    icon: Users,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Configurações',
    href: '/settings',
    icon: Settings,
  },
];

export function DashboardSidebar({
  organizationSlug,
  organizationName,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex w-64 flex-col bg-card border-r">
      {/* Logo/Org name */}
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-lg font-semibold truncate">{organizationName}</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const href = `/${organizationSlug}${item.href}`;
          const isActive = pathname === href || pathname.startsWith(href + '/');

          return (
            <Link
              key={item.name}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          MendoHub v1.0.0
        </p>
      </div>
    </div>
  );
}
