/**
 * New Client Page
 *
 * Formulário para criar nova organização/cliente.
 * Protegido pelo layout admin (requirePlatformAdmin).
 */

import { requirePlatformAdmin } from '@/lib/auth/guards';
import { getPlanRepository } from '@/lib/db/supabase/repositories/plan';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { NewClientForm } from './form';

export const metadata = {
  title: 'Novo Cliente - Admin - MendoHub',
  description: 'Criar nova organização/cliente',
};

export default async function NewClientPage() {
  await requirePlatformAdmin();

  // Buscar planos disponíveis
  const planRepo = getPlanRepository();
  const plans = await planRepo.findAllActive();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Clientes
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Novo Cliente</h1>
        <p className="mt-1 text-sm text-gray-500">
          Crie uma nova organização/cliente na plataforma
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <NewClientForm plans={plans} />
      </div>
    </div>
  );
}
