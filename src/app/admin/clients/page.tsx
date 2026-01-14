/**
 * Admin Clients Page
 *
 * Página para gerenciamento de clientes/organizações.
 * Protegido pelo layout admin (requirePlatformAdmin).
 */

import { requirePlatformAdmin } from '@/lib/auth/guards';
import { getOrganizationRepository } from '@/lib/db/supabase/repositories/organization';
import { formatDate } from '@/lib/utils/format';
import { Building2, Plus, Search, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Clientes - Admin - MendoHub',
  description: 'Gerenciamento de clientes e organizações',
};

const STATUS_LABELS = {
  trial: 'Trial',
  active: 'Ativo',
  suspended: 'Suspenso',
  cancelled: 'Cancelado',
} as const;

const STATUS_COLORS = {
  trial: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
} as const;

export default async function AdminClientsPage() {
  await requirePlatformAdmin();

  // Buscar clientes do banco de dados
  const orgRepo = getOrganizationRepository();
  const clients = await orgRepo.findAllWithPlan();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie todas as organizações da plataforma
          </p>
        </div>
        <Link
          href="/admin/clients/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Link>
      </div>

      {/* Stats */}
      {clients.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-medium text-gray-500">Total</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {clients.length}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-medium text-gray-500">Ativos</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {clients.filter((c) => c.status === 'active').length}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-medium text-gray-500">Trial</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {clients.filter((c) => c.status === 'trial').length}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-medium text-gray-500">Suspensos</p>
            <p className="mt-1 text-2xl font-bold text-yellow-600">
              {clients.filter((c) => c.status === 'suspended').length}
            </p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar clientes..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Clients List/Table */}
      {clients.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Nenhum cliente cadastrado
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Comece criando seu primeiro cliente
          </p>
          <Link
            href="/admin/clients/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Criar Cliente
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Organização
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Plano
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {client.name}
                          </p>
                          <p className="text-xs text-gray-500">/{client.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {client.plan?.name || 'Sem plano'}
                      </p>
                      {client.plan && (
                        <p className="text-xs text-gray-500">
                          R$ {client.plan.price_monthly.toFixed(2)}/mês
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          STATUS_COLORS[
                            client.status as keyof typeof STATUS_COLORS
                          ]
                        }`}
                      >
                        {
                          STATUS_LABELS[
                            client.status as keyof typeof STATUS_LABELS
                          ]
                        }
                      </span>
                      {client.status === 'trial' && client.trial_ends_at && (
                        <p className="mt-1 text-xs text-gray-500">
                          até {formatDate(client.trial_ends_at)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(client.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/${client.slug}/dashboard`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Acessar
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
