/**
 * Admin Layout
 *
 * Layout principal para todas as páginas do admin dashboard.
 * Protegido por requirePlatformAdmin.
 *
 * Estrutura:
 * - Sidebar fixa à esquerda (240px)
 * - Header no topo
 * - Conteúdo principal à direita
 */

import { requirePlatformAdmin } from '@/lib/auth/guards';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Proteger todas as rotas admin
  const { admin } = await requirePlatformAdmin();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader admin={admin} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
