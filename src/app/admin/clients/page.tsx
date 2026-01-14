/**
 * Admin Clients Page
 *
 * Página para gerenciamento de clientes/organizações.
 * Protegido pelo layout admin (requirePlatformAdmin).
 */

import { requirePlatformAdmin } from '@/lib/auth/guards';
import { Building2, Plus, Search } from 'lucide-react';

export const metadata = {
  title: 'Clientes - Admin - MendoHub',
  description: 'Gerenciamento de clientes e organizações',
};

export default async function AdminClientsPage() {
  await requirePlatformAdmin();

  // TODO: Buscar clientes do banco de dados
  const clients = [];

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
        <a
          href="/admin/clients/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </a>
      </div>

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
          <a
            href="/admin/clients/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Criar Cliente
          </a>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white">
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
            <tbody className="divide-y divide-gray-200">
              {/* TODO: Map clients here */}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
