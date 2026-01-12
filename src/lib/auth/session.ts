/**
 * Session Helpers
 *
 * Helpers para trabalhar com sessão do usuário autenticado.
 *
 * Use em:
 * - Server Components
 * - API Routes
 * - Server Actions
 */

import { createClient } from '@/lib/db/supabase/server';
import type { User } from '@supabase/supabase-js';

/**
 * Retorna o usuário atualmente autenticado (se houver)
 *
 * @returns User | null
 *
 * Exemplo:
 * const user = await getCurrentUser();
 * if (!user) {
 *   redirect('/login');
 * }
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

/**
 * Retorna o ID do usuário atualmente autenticado
 *
 * @returns string | null
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

/**
 * Verifica se o usuário está autenticado
 *
 * @returns boolean
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}
