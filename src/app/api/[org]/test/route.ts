/**
 * Rota de teste para validar middleware withTenant
 * DELETE ESTE ARQUIVO após validar Checkpoint 1
 */

import { withTenant } from '@/lib/middleware/with-tenant';
import { success } from '@/lib/api/response';

export const GET = withTenant(async (_req, tenant, params) => {
  return success({
    message: 'Middleware funcionando!',
    tenant: {
      organizationId: tenant.organizationId,
      userId: tenant.userId,
      userRole: tenant.userRole,
    },
    params: {
      org: params.org,
    },
  });
});
