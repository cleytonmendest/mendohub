/**
 * Supabase Client - Server-side
 *
 * Use este cliente em:
 * - Server Components (app router sem 'use client')
 * - API Routes (app/api/*)
 * - Server Actions
 *
 * IMPORTANTE:
 * - Usa cookies para manter sessão do usuário
 * - RLS policies são aplicadas automaticamente
 * - Precisa ser async/await
 * - Mantém contexto do usuário autenticado
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
