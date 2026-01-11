/**
 * Supabase Client - Admin (Service Role)
 *
 * Use este cliente em:
 * - Operações administrativas que precisam BYPASS RLS
 * - Webhooks do WhatsApp (inserir mensagens sem usuário)
 * - Background jobs
 * - Migrations e seeds
 *
 * ⚠️ IMPORTANTE - SEGURANÇA:
 * - NUNCA use este cliente em código que pode ser exposto ao browser
 * - NUNCA retorne este cliente para o cliente (Client Components)
 * - Usa SERVICE_ROLE_KEY que BYPASSA todas as RLS policies
 * - Tenha MUITO cuidado ao usar este cliente
 *
 * Casos de uso válidos:
 * ✅ Webhook do WhatsApp inserindo mensagens
 * ✅ Criar organizações (platform admin)
 * ✅ Sistema de billing automático
 * ✅ Background jobs (usage tracking)
 *
 * Casos de uso INVÁLIDOS:
 * ❌ Buscar dados do usuário (use server.ts)
 * ❌ Qualquer operação em Client Components
 * ❌ Operações que o próprio usuário pode fazer
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
