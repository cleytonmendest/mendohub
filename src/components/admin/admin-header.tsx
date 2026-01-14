/**
 * Admin Header
 *
 * Header do dashboard administrativo com informações do admin e logout.
 */

import { LogOut, User } from 'lucide-react';
import { logout } from '@/app/(auth)/login/actions';
import type { Database } from '@/types/database';

type PlatformAdmin = Database['public']['Tables']['platform_admins']['Row'];

interface AdminHeaderProps {
  admin: PlatformAdmin;
}

export function AdminHeader({ admin }: AdminHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      {/* Page Title / Breadcrumb (pode ser customizado depois) */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          Admin Dashboard
        </h1>
      </div>

      {/* User Menu */}
      <div className="flex items-center gap-4">
        {/* Admin Info */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <User className="h-5 w-5 text-blue-700" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900">{admin.full_name}</p>
            <p className="text-gray-500">{admin.role}</p>
          </div>
        </div>

        {/* Logout Button */}
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
