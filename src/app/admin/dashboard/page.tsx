/**
 * Admin Dashboard Page
 *
 * Dashboard principal para Platform Admins.
 * Protegido pelo layout admin (requirePlatformAdmin).
 */

import { requirePlatformAdmin } from '@/lib/auth/guards';
import { Users, Building2, CreditCard, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'Admin Dashboard - MendoHub',
  description: 'Dashboard administrativo do MendoHub',
};

export default async function AdminDashboardPage() {
  const { admin } = await requirePlatformAdmin();

  // TODO: Buscar dados reais do banco
  const stats = [
    {
      name: 'Total de Clientes',
      value: '0',
      icon: Building2,
      change: '+0%',
      changeType: 'positive',
    },
    {
      name: 'Usuários Ativos',
      value: '0',
      icon: Users,
      change: '+0%',
      changeType: 'positive',
    },
    {
      name: 'MRR',
      value: 'R$ 0',
      icon: CreditCard,
      change: '+0%',
      changeType: 'positive',
    },
    {
      name: 'Conversas (mês)',
      value: '0',
      icon: TrendingUp,
      change: '+0%',
      changeType: 'positive',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bem-vindo, {admin.full_name}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Aqui está uma visão geral da plataforma
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">
                  {stat.name}
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Ações Rápidas
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/admin/clients/new"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
          >
            <Building2 className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">
              Criar Cliente
            </span>
          </a>
          <a
            href="/admin/clients"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
          >
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">
              Ver Clientes
            </span>
          </a>
          <a
            href="/admin/logs"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
          >
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">
              Ver Logs
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
