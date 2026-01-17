/**
 * Route Guards
 *
 * Helpers para proteger rotas e exigir autenticação/permissões.
 *
 * Use em:
 * - Server Components (pages)
 * - API Routes
 * - Server Actions
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/db/supabase/server';
import { getCurrentUser } from './session';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type PlatformAdmin = Database['public']['Tables']['platform_admins']['Row'];

/**
 * Exige que o usuário esteja autenticado
 *
 * Se não estiver autenticado, redireciona para /login
 *
 * @returns User
 *
 * Exemplo:
 * export default async function ProtectedPage() {
 *   const user = await requireAuth();
 *   return <div>Olá, {user.email}</div>;
 * }
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

/**
 * Exige que o usuário seja um Platform Admin ativo
 *
 * Se não for platform admin ou não estiver ativo, redireciona para /unauthorized
 *
 * @returns { user: User, admin: PlatformAdmin }
 *
 * Exemplo:
 * export default async function AdminPage() {
 *   const { user, admin } = await requirePlatformAdmin();
 *   return <div>Admin: {admin.full_name} ({admin.role})</div>;
 * }
 */
export async function requirePlatformAdmin(): Promise<{
  user: User;
  admin: PlatformAdmin;
}> {
  const user = await requireAuth();

  // Verificar se é platform admin (RLS permite que admins vejam sua própria linha)
  const supabase = await createClient();

  const { data: platformAdmin, error } = await supabase
    .from('platform_admins')
    .select('*')
    .eq('id', user.id)
    .eq('is_active', true)
    .single();

  if (error || !platformAdmin) {
    redirect('/unauthorized');
  }

  return {
    user,
    admin: platformAdmin,
  };
}

/**
 * Verifica se o usuário tem acesso a uma organização
 *
 * @param organizationId - ID da organização
 * @returns boolean
 */
export async function canAccessOrganization(
  organizationId: string
): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const supabase = await createClient();

  // Verificar se o usuário pertence à organização
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .eq('organization_id', organizationId)
    .single();

  return !error && data !== null;
}

/**
 * Exige que o usuário tenha acesso a uma organização
 *
 * Se não tiver acesso, redireciona para /unauthorized
 *
 * @param organizationId - ID da organização
 */
export async function requireOrganizationAccess(
  organizationId: string
): Promise<void> {
  const hasAccess = await canAccessOrganization(organizationId);

  if (!hasAccess) {
    redirect('/unauthorized');
  }
}
