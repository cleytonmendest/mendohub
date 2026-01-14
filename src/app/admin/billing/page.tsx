/**
 * Admin Billing Page
 *
 * Página para visualização de billing e uso da plataforma.
 * Protegido pelo layout admin (requirePlatformAdmin).
 */

import { requirePlatformAdmin } from '@/lib/auth/guards';
import { DollarSign, TrendingUp, Users, MessageSquare } from 'lucide-react';

export const metadata = {
  title: 'Billing - Admin - MendoHub',
  description: 'Visualização de billing e uso da plataforma',
};

export default async function AdminBillingPage() {
  await requirePlatformAdmin();

  // TODO: Buscar dados de billing do banco
  const billingStats = [
    {
      name: 'MRR',
      value: 'R$ 0',
      change: '+0%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
    {
      name: 'Clientes Ativos',
      value: '0',
      change: '+0%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      name: 'Mensagens (mês)',
      value: '0',
      change: '+0%',
      changeType: 'positive' as const,
      icon: MessageSquare,
    },
    {
      name: 'Ticket Médio',
      value: 'R$ 0',
      change: '+0%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visão geral de faturamento e uso da plataforma
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {billingStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
                  <Icon className="h-6 w-6 text-green-600" />
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
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Receita Mensal (MRR)
        </h2>
        <div className="mt-6 flex h-64 items-center justify-center rounded-lg bg-gray-50">
          <p className="text-sm text-gray-500">
            Gráfico de receita será implementado
          </p>
        </div>
      </div>

      {/* Top Clients by Revenue */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Top Clientes por Receita
        </h2>
        <div className="mt-6">
          <div className="flex h-32 items-center justify-center rounded-lg bg-gray-50">
            <p className="text-sm text-gray-500">
              Tabela de top clientes será implementada
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
