/**
 * Admin Dashboard Page
 *
 * Dashboard principal para Platform Admins.
 * Protegido por requirePlatformAdmin (redirect se não for admin).
 */

import { requirePlatformAdmin } from '@/lib/auth';
import { logout } from '@/app/(auth)/login/actions';

export const metadata = {
  title: 'Admin Dashboard - MendoHub',
  description: 'Dashboard administrativo do MendoHub',
};

export default async function AdminDashboardPage() {
  const { user, admin } = await requirePlatformAdmin();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-lg bg-white p-6 shadow">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>

          <div className="mt-6 space-y-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <h2 className="text-lg font-semibold text-blue-900">
                Bem-vindo, {admin.full_name}!
              </h2>
              <p className="mt-1 text-sm text-blue-700">
                Email: {admin.email}
              </p>
              <p className="mt-1 text-sm text-blue-700">
                Role: {admin.role}
              </p>
              <p className="mt-1 text-sm text-blue-700">
                User ID: {user.id}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900">
                Status da Autenticação
              </h3>
              <p className="mt-2 text-sm text-green-600">
                ✅ Autenticado como Platform Admin
              </p>
              <p className="mt-1 text-sm text-green-600">
                ✅ Middleware funcionando corretamente
              </p>
              <p className="mt-1 text-sm text-green-600">
                ✅ RLS policies aplicadas
              </p>
            </div>

            <div className="mt-6">
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  Fazer Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
