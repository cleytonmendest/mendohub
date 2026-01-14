/**
 * New Client Actions
 *
 * Server Actions para criar nova organização/cliente.
 */

'use server';

import { requirePlatformAdmin } from '@/lib/auth/guards';
import { getOrganizationRepository } from '@/lib/db/supabase/repositories/organization';
import { createAdminClient } from '@/lib/db/supabase/admin';
import { createOrganizationSchema } from '@/lib/validations/organization';
import { logger } from '@/lib/utils/logger';

export type CreateClientResult =
  | { success: true; organizationId: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Cria nova organização/cliente
 */
export async function createClientAction(
  formData: FormData
): Promise<CreateClientResult> {
  // Verificar permissão
  const { admin } = await requirePlatformAdmin();

  // Extrair dados do form
  const rawData = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    plan_id: formData.get('plan_id') as string,
    trial_days: formData.get('trial_days')
      ? parseInt(formData.get('trial_days') as string, 10)
      : undefined,
  };

  // Validar dados
  const validation = createOrganizationSchema.safeParse(rawData);

  if (!validation.success) {
    logger.warn('create_client_validation_failed', {
      admin_id: admin.id,
      errors: validation.error.flatten(),
    });

    return {
      success: false,
      error: 'Dados inválidos. Verifique os campos.',
      fieldErrors: validation.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const data = validation.data;

  try {
    // Verificar se slug já existe (usar admin client para bypass RLS)
    const adminClient = createAdminClient();
    const { data: existingOrg } = await adminClient
      .from('organizations')
      .select('id')
      .eq('slug', data.slug)
      .is('deleted_at', null)
      .maybeSingle();

    if (existingOrg) {
      logger.warn('create_client_slug_exists', {
        admin_id: admin.id,
        slug: data.slug,
      });

      return {
        success: false,
        error: 'Slug já está em uso. Escolha outro.',
        fieldErrors: {
          slug: ['Slug já está em uso'],
        },
      };
    }

    // Calcular trial_ends_at se trial_days foi fornecido
    const trial_ends_at = data.trial_days
      ? new Date(Date.now() + data.trial_days * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    // Criar organização (já usa admin client internamente)
    const orgRepo = getOrganizationRepository();
    const organization = await orgRepo.create({
      name: data.name,
      slug: data.slug,
      plan_id: data.plan_id,
      timezone: 'America/Sao_Paulo', // Default timezone (pode ser alterado depois em settings)
      trial_ends_at,
      status: data.trial_days && data.trial_days > 0 ? 'trial' : 'active',
    });

    logger.info('client_created', {
      admin_id: admin.id,
      organization_id: organization.id,
      slug: organization.slug,
    });

    return {
      success: true,
      organizationId: organization.id,
    };
  } catch (error) {
    logger.error('create_client_failed', {
      admin_id: admin.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      success: false,
      error: 'Erro ao criar cliente. Tente novamente.',
    };
  }
}
