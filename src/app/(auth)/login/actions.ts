/**
 * Login Actions
 *
 * Server Actions para autenticação (login/logout).
 */

'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/db/supabase/server';
import { createAdminClient } from '@/lib/db/supabase/admin';
import { logger } from '@/lib/utils/logger';

export type LoginResult =
  | { success: true }
  | { success: false; error: string };

export type LoginState = { error: string } | null;

/**
 * Login Action para useFormState
 */
export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    logger.error('login_failed', {
      email,
      error: error.message,
    });

    return { error: error.message };
  }

  logger.info('login_success', {
    user_id: data.user.id,
    email: data.user.email,
  });

  // Verificar se é platform admin ou usuário de organização
  const adminClient = createAdminClient();

  const { data: platformAdmin, error: adminError } = await adminClient
    .from('platform_admins')
    .select('id')
    .eq('id', data.user.id)
    .eq('is_active', true)
    .single();

  logger.info('platform_admin_check', {
    user_id: data.user.id,
    found: !!platformAdmin,
    error: adminError?.message,
  });

  if (platformAdmin) {
    logger.info('redirecting_to_admin_dashboard', { user_id: data.user.id });
    redirect('/admin/dashboard');
  }

  logger.info('not_platform_admin_checking_org', { user_id: data.user.id });

  // Pegar organização do usuário
  const { data: userData, error: userError } = await adminClient
    .from('users')
    .select('organization:organizations(slug)')
    .eq('id', data.user.id)
    .single();

  logger.info('organization_check', {
    user_id: data.user.id,
    found: !!userData?.organization,
    error: userError?.message,
  });

  if (userData?.organization) {
    const orgSlug = (userData.organization as { slug: string }).slug;
    redirect(`/${orgSlug}/dashboard`);
  }

  // Se não encontrou nem admin nem organização, erro
  logger.error('login_no_role', {
    user_id: data.user.id,
  });

  return { error: 'Usuário sem permissões. Contate o administrador.' };
}

/**
 * Faz login com email e senha (versão antiga - deprecated)
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    logger.error('login_failed', {
      email,
      error: error.message,
    });

    return {
      success: false,
      error: error.message,
    };
  }

  logger.info('login_success', {
    user_id: data.user.id,
    email: data.user.email,
  });

  // Verificar se é platform admin ou usuário de organização
  const adminClient = createAdminClient();

  const { data: platformAdmin, error: adminError } = await adminClient
    .from('platform_admins')
    .select('id')
    .eq('id', data.user.id)
    .eq('is_active', true)
    .single();

  logger.info('platform_admin_check', {
    user_id: data.user.id,
    found: !!platformAdmin,
    error: adminError?.message,
  });

  if (platformAdmin) {
    logger.info('redirecting_to_admin_dashboard', { user_id: data.user.id });
    redirect('/admin/dashboard');
  }

  logger.info('not_platform_admin_checking_org', { user_id: data.user.id });

  // Pegar organização do usuário
  const { data: userData, error: userError } = await adminClient
    .from('users')
    .select('organization:organizations(slug)')
    .eq('id', data.user.id)
    .single();

  logger.info('organization_check', {
    user_id: data.user.id,
    found: !!userData?.organization,
    error: userError?.message,
  });

  if (userData?.organization) {
    const orgSlug = (userData.organization as { slug: string }).slug;
    redirect(`/${orgSlug}/dashboard`);
  }

  // Se não encontrou nem admin nem organização, erro
  logger.error('login_no_role', {
    user_id: data.user.id,
  });

  return {
    success: false,
    error: 'Usuário sem permissões. Contate o administrador.',
  };
}

/**
 * Faz logout
 */
export async function logout(): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    logger.info('logout', { user_id: user.id });
  }

  await supabase.auth.signOut();

  redirect('/login');
}
