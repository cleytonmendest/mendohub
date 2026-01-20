/**
 * GET /api/[org]/message-templates
 *
 * Lista templates de mensagens da organização
 * Filtros: category (opcional)
 */

import { withTenant } from '@/lib/middleware/with-tenant';
import { success, error } from '@/lib/api/response';
import { getMessageTemplateRepository } from '@/lib/db/supabase/repositories/message_template';

export const GET = withTenant(async (req, tenant) => {
  try {
    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const category = searchParams.get('category') || undefined;

    // Get repository
    const templateRepo = getMessageTemplateRepository();

    // Fetch templates
    const templates = await templateRepo.findByOrganizationId(
      tenant.organizationId,
      {
        category,
      }
    );

    return success(templates);
  } catch (err) {
    console.error('Error fetching message templates:', err);
    return error('Failed to fetch message templates', 500);
  }
});
