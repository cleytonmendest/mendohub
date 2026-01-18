/**
 * Tenant Context Middleware
 *
 * CRÍTICO para segurança multi-tenant.
 * Todas as inbox routes DEVEM usar este middleware.
 *
 * Garante que:
 * 1. Usuário está autenticado
 * 2. Usuário pertence a uma organização
 * 3. Org slug na URL pertence ao usuário
 * 4. Previne vazamento de dados cross-tenant
 */

import { createClient } from '@/lib/db/supabase/server';
import { error } from '@/lib/api/response';

export type TenantContext = {
  organizationId: string;
  userId: string;
  userRole: string;
};

/**
 * Middleware para validação de tenant (organização)
 *
 * @param handler - Handler que recebe (req, tenant, params)
 * @returns Next.js route handler com validação de tenant
 *
 * @example
 * export const GET = withTenant(async (req, tenant, params) => {
 *   // tenant.organizationId já está validado
 *   const data = await getDataForOrg(tenant.organizationId);
 *   return success(data);
 * });
 */
export function withTenant<T extends { org: string }>(
  handler: (
    req: Request,
    tenant: TenantContext,
    params: T
  ) => Promise<Response>
) {
  return async (
    req: Request,
    context: { params: Promise<T> }
  ): Promise<Response> => {
    const params = await context.params;

    try {
      // 1. Get authenticated user
      const supabase = await createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return error('Não autenticado', 401);
      }

      // 2. Check if user is platform admin (separate table)
      const { data: platformAdmin } = (await supabase
        .from('platform_admins')
        .select('is_active')
        .eq('id', user.id)
        .single()) as {
        data: { is_active: boolean } | null;
        error: any;
      };

      const isPlatformAdmin = platformAdmin?.is_active === true;

      // 3. Get organization by slug
      const { data: org, error: orgError } = (await supabase
        .from('organizations')
        .select('id')
        .eq('slug', params.org)
        .single()) as {
        data: { id: string } | null;
        error: any;
      };

      if (orgError || !org) {
        return error('Organização não encontrada', 404);
      }

      // 4. If not platform admin, validate regular user access
      let userRole = 'platform_admin'; // default for platform admins

      if (!isPlatformAdmin) {
        // Get user's organization
        const { data: userRecord, error: userError } = (await supabase
          .from('users')
          .select('organization_id, role')
          .eq('id', user.id)
          .single()) as {
          data: { organization_id: string | null; role: string } | null;
          error: any;
        };

        if (userError || !userRecord) {
          return error('Usuário não encontrado', 403);
        }

        if (!userRecord.organization_id) {
          return error('Usuário sem organização', 403);
        }

        if (org.id !== userRecord.organization_id) {
          return error('Acesso negado a esta organização', 403);
        }

        userRole = userRecord.role;
      }

      // 5. Pass validated context to handler
      const tenant: TenantContext = {
        organizationId: org.id,
        userId: user.id,
        userRole,
      };

      return handler(req, tenant, params);
    } catch (err) {
      console.error('Error in withTenant middleware:', err);
      return error('Erro interno do servidor', 500);
    }
  };
}
