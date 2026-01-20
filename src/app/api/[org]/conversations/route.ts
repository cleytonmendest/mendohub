/**
 * GET /api/[org]/conversations
 *
 * Lista conversas do inbox
 * Filtros: status, assignedTo, limit, offset
 */

import { withTenant } from '@/lib/middleware/with-tenant';
import { success, error } from '@/lib/api/response';
import { getConversationRepository } from '@/lib/db/supabase/repositories/conversation';

export const GET = withTenant(async (req, tenant) => {
  try {
    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const status = searchParams.get('status') || undefined;
    const assignedTo = searchParams.get('assignedTo') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate status if provided
    if (status && !['open', 'assigned', 'resolved', 'closed'].includes(status)) {
      return error('Invalid status. Must be: open, assigned, resolved, closed', 400);
    }

    // Validate pagination
    if (limit < 1 || limit > 100) {
      return error('Invalid limit. Must be between 1 and 100', 400);
    }

    if (offset < 0) {
      return error('Invalid offset. Must be >= 0', 400);
    }

    // Get repository
    const conversationRepo = getConversationRepository();

    // Fetch conversations
    const conversations = await conversationRepo.findByOrganizationId(
      tenant.organizationId,
      {
        status: status as 'open' | 'assigned' | 'resolved' | 'closed' | undefined,
        assignedTo,
        limit,
        offset,
      }
    );

    return success(conversations);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    return error('Failed to fetch conversations', 500);
  }
});
