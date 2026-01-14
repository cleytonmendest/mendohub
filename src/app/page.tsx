/**
 * Home Page
 *
 * Redireciona para o dashboard apropriado baseado no tipo de usuário.
 * - Platform Admin → /admin/dashboard
 * - Organization User → /[org]/dashboard
 * - Não autenticado → /login
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/db/supabase/admin';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const adminClient = createAdminClient();

  // Verificar se é platform admin
  const { data: platformAdmin } = await adminClient
    .from('platform_admins')
    .select('id')
    .eq('id', user.id)
    .eq('is_active', true)
    .single();

  if (platformAdmin) {
    redirect('/admin/dashboard');
  }

  // Pegar organização do usuário
  const { data: userData } = await adminClient
    .from('users')
    .select('organization:organizations(slug)')
    .eq('id', user.id)
    .single();

  if (userData?.organization) {
    const orgSlug = (userData.organization as { slug: string }).slug;
    redirect(`/${orgSlug}/dashboard`);
  }

  // Se não encontrou nem admin nem organização, unauthorized
  redirect('/unauthorized');
}
