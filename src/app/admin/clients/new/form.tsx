'use client';

/**
 * New Client Form
 *
 * Formulário para criar nova organização.
 * Usa useFormState para progressive enhancement.
 */

import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClientAction, type CreateClientResult } from './actions';
import type { Plan } from '@/lib/db/repositories/plan';

interface NewClientFormProps {
  plans: Plan[];
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
    >
      {pending ? 'Criando...' : 'Criar Cliente'}
    </button>
  );
}

export function NewClientForm({ plans }: NewClientFormProps) {
  const router = useRouter();
  const [result, formAction] = useFormState<CreateClientResult | null, FormData>(
    async (_, formData) => {
      const res = await createClientAction(formData);
      return res;
    },
    null
  );

  const [nameValue, setNameValue] = useState('');

  // Auto-gerar slug a partir do nome
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .replace(/^-|-$/g, ''); // Remove hífens no início e fim
  };

  // Redirecionar para lista de clientes após sucesso
  useEffect(() => {
    if (result?.success) {
      router.push('/admin/clients');
    }
  }, [result, router]);

  return (
    <form action={formAction} className="space-y-6">
      {/* Error Alert */}
      {result && !result.success && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{result.error}</p>
        </div>
      )}

      {/* Success Alert */}
      {result?.success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">
            Cliente criado com sucesso! Redirecionando...
          </p>
        </div>
      )}

      {/* Nome */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Nome da Organização *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Ex: Acme Corporation"
        />
        {result && !result.success && result.fieldErrors?.name && (
          <p className="mt-1 text-sm text-red-600">
            {result.fieldErrors.name[0]}
          </p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-gray-700"
        >
          Slug (URL amigável) *
        </label>
        <div className="mt-1 flex rounded-lg border border-gray-300">
          <span className="inline-flex items-center rounded-l-lg border-r border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
            mendohub.com/
          </span>
          <input
            type="text"
            id="slug"
            name="slug"
            required
            defaultValue={generateSlug(nameValue)}
            className="flex-1 rounded-r-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="acme"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Apenas letras minúsculas, números e hífens
        </p>
        {result && !result.success && result.fieldErrors?.slug && (
          <p className="mt-1 text-sm text-red-600">
            {result.fieldErrors.slug[0]}
          </p>
        )}
      </div>

      {/* Plano */}
      <div>
        <label
          htmlFor="plan_id"
          className="block text-sm font-medium text-gray-700"
        >
          Plano *
        </label>
        <select
          id="plan_id"
          name="plan_id"
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Selecione um plano</option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} - R$ {plan.price_monthly.toFixed(2)}/mês
            </option>
          ))}
        </select>
        {result && !result.success && result.fieldErrors?.plan_id && (
          <p className="mt-1 text-sm text-red-600">
            {result.fieldErrors.plan_id[0]}
          </p>
        )}
      </div>

      {/* Trial Days */}
      <div>
        <label
          htmlFor="trial_days"
          className="block text-sm font-medium text-gray-700"
        >
          Dias de Trial (Opcional)
        </label>
        <input
          type="number"
          id="trial_days"
          name="trial_days"
          min="0"
          max="365"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Ex: 14"
        />
        <p className="mt-1 text-xs text-gray-500">
          Deixe em branco para ativar imediatamente
        </p>
        {result && !result.success && result.fieldErrors?.trial_days && (
          <p className="mt-1 text-sm text-red-600">
            {result.fieldErrors.trial_days[0]}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 border-t border-gray-200 pt-6">
        <SubmitButton />
        <button
          type="button"
          onClick={() => router.push('/admin/clients')}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
