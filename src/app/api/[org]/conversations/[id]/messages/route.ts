/**
 * GET /api/[org]/conversations/[id]/messages
 * POST /api/[org]/conversations/[id]/messages
 *
 * Carregar histórico de mensagens e enviar novas mensagens
 */

import { z } from 'zod';
import { withTenant } from '@/lib/middleware/with-tenant';
import { success, error } from '@/lib/api/response';
import { getMessageRepository } from '@/lib/db/supabase/repositories/message';
import { getConversationRepository } from '@/lib/db/supabase/repositories/conversation';
import { getMessageTemplateRepository } from '@/lib/db/supabase/repositories/message_template';
import { getWhatsAppService } from '@/lib/services/whatsapp/api';

/**
 * GET - Lista mensagens de uma conversa
 * Side effect: Marca conversa como lida
 */
export const GET = withTenant(async (_req, _tenant, params: { org: string; id: string }) => {
  try {
    const conversationId = params.id;

    // Get repositories
    const messageRepo = getMessageRepository();
    const conversationRepo = getConversationRepository();

    // Fetch messages
    const messages = await messageRepo.findByConversationId(conversationId);

    // Mark conversation as read (side effect)
    try {
      await conversationRepo.markAsRead(conversationId);
    } catch (markReadError) {
      // Don't fail the request if marking as read fails
      console.error('Failed to mark conversation as read:', markReadError);
    }

    return success(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    return error('Failed to fetch messages', 500);
  }
});

/**
 * POST - Enviar mensagem para WhatsApp
 */
const SendMessageSchema = z.object({
  content: z.string().min(1).max(4096), // WhatsApp limit
  templateId: z.string().uuid().optional(),
});

export const POST = withTenant(async (req, tenant, params: { org: string; id: string }) => {
  try {
    const conversationId = params.id;

    // Parse and validate body
    const body = await req.json();
    const validation = SendMessageSchema.safeParse(body);

    if (!validation.success) {
      return error(
        `Invalid request: ${validation.error.errors.map((e) => e.message).join(', ')}`,
        400
      );
    }

    const { content, templateId } = validation.data;

    // Get repositories and services
    const conversationRepo = getConversationRepository();
    const messageRepo = getMessageRepository();
    const templateRepo = getMessageTemplateRepository();
    const whatsappService = getWhatsAppService();

    // 1. Buscar conversation
    const conversation = await conversationRepo.findById(conversationId);

    if (!conversation) {
      return error('Conversation not found', 404);
    }

    // Verify tenant ownership via organization_id
    if (conversation.organization_id !== tenant.organizationId) {
      return error('Access denied to this conversation', 403);
    }

    // 2. Enviar via WhatsApp API
    let wamid: string;
    try {
      wamid = await whatsappService.sendMessage({
        connectionId: conversation.connection_id,
        to: conversation.customer_phone,
        text: content,
      });
    } catch (whatsappError: any) {
      console.error('WhatsApp API error:', whatsappError);
      return error(
        `Failed to send message via WhatsApp: ${whatsappError.message}`,
        500
      );
    }

    // 3. Salvar no banco (apenas se WhatsApp API sucesso)
    const message = await messageRepo.create({
      conversation_id: conversationId,
      wamid,
      direction: 'outbound',
      content,
      status: 'sent',
      sent_by: tenant.userId,
    });

    // 4. Incrementar template usage (se usado)
    if (templateId) {
      try {
        await templateRepo.incrementUsage(templateId);
      } catch (templateError) {
        // Don't fail the request if template increment fails
        console.error('Failed to increment template usage:', templateError);
      }
    }

    return success(message);
  } catch (err) {
    console.error('Error sending message:', err);
    return error('Failed to send message', 500);
  }
});
