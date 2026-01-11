/**
 * Supabase Client - Client-side (Browser)
 *
 * Use este cliente em:
 * - Client Components (components com 'use client')
 * - Interações do usuário (onClick, onChange, etc)
 * - Hooks React
 *
 * IMPORTANTE:
 * - Usa ANON_KEY (seguro para exposição no browser)
 * - RLS policies são aplicadas automaticamente
 * - Só acessa dados do usuário autenticado
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
