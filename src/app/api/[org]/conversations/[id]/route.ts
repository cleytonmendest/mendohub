/**
 * PUT /api/[org]/conversations/[id]
 *
 * Atualizar conversa (assign, status, tags)
 */

import { z } from 'zod';
import { withTenant } from '@/lib/middleware/with-tenant';
import { success, error } from '@/lib/api/response';
import { getConversationRepository } from '@/lib/db/supabase/repositories/conversation';

const UpdateConversationSchema = z.object({
  assignedTo: z.string().uuid().nullable().optional(),
  status: z.enum(['open', 'assigned', 'resolved', 'closed']).optional(),
  tags: z.array(z.string()).optional(),
});

export const PUT = withTenant(async (req, tenant, params: { org: string; id: string }) => {
  try {
    const conversationId = params.id;

    // Parse and validate body
    const body = await req.json();
    const validation = UpdateConversationSchema.safeParse(body);

    if (!validation.success) {
      return error(
        `Invalid request: ${validation.error.errors.map((e) => e.message).join(', ')}`,
        400
      );
    }

    const { assignedTo, status, tags } = validation.data;

    // Get repository
    const conversationRepo = getConversationRepository();

    // Verify conversation exists and belongs to organization
    const conversation = await conversationRepo.findById(conversationId);

    if (!conversation) {
      return error('Conversation not found', 404);
    }

    // Verify tenant ownership via organization_id from JOIN
    if (conversation.organization_id !== tenant.organizationId) {
      return error('Access denied to this conversation', 403);
    }

    // Build update data
    const updateData: any = {};

    if (assignedTo !== undefined) {
      updateData.assigned_to = assignedTo;
      // Se atribuindo a alguém, adicionar assigned_at
      if (assignedTo !== null) {
        updateData.assigned_at = new Date().toISOString();
      }
    }

    if (status !== undefined) {
      updateData.status = status;
      // Se status = 'resolved', adicionar resolved_at
      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }
    }

    if (tags !== undefined) {
      updateData.tags = tags;
    }

    // Update conversation
    const updated = await conversationRepo.update(conversationId, updateData);

    return success(updated);
  } catch (err) {
    console.error('Error updating conversation:', err);
    return error('Failed to update conversation', 500);
  }
});
