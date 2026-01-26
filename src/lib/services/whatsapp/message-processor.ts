/**
 * WhatsApp Message Processor
 *
 * Processa mensagens recebidas via webhook:
 * - Salva mensagem no banco
 * - Cria/atualiza conversa
 * - Envia saudação automática (primeira mensagem)
 */

import { getMessageRepository } from '@/lib/db/supabase/repositories/message';
import { getConversationRepository } from '@/lib/db/supabase/repositories/conversation';
import { getOrganizationRepository } from '@/lib/db/supabase/repositories/organization';
import { getWhatsAppService } from './api';

interface IncomingMessage {
  id: string; // WhatsApp message ID
  from: string; // Número do cliente (5511999998888)
  type: 'text' | 'image' | 'document' | 'audio' | 'video';
  timestamp: string; // Unix timestamp
  text?: {
    body: string;
  };
}

export class MessageProcessor {
  private readonly messageRepo = getMessageRepository();
  private readonly conversationRepo = getConversationRepository();
  private readonly orgRepo = getOrganizationRepository();
  private readonly whatsappService = getWhatsAppService();

  /**
   * Processa mensagem inbound recebida via webhook
   */
  async processIncomingMessage(params: {
    message: IncomingMessage;
    connectionId: string;
    organizationId: string;
  }): Promise<void> {
    const { message, connectionId, organizationId } = params;

    try {
      // 1. Buscar ou criar conversa
      const conversation = await this.getOrCreateConversation({
        connectionId,
        customerPhone: message.from,
      });

      // 2. Salvar mensagem inbound
      await this.messageRepo.create({
        conversation_id: conversation.id,
        wamid: message.id,
        direction: 'inbound',
        type: message.type,
        content: message.text?.body || '',
        status: 'received',
      });

      // 3. Atualizar última mensagem da conversa
      await this.conversationRepo.update(conversation.id, {
        last_message_at: new Date().toISOString(),
        last_message_content: message.text?.body || `[${message.type}]`,
        unread_count: (conversation.unread_count || 0) + 1,
      });

      // 4. Verificar se é primeira mensagem e enviar saudação
      await this.sendWelcomeMessageIfNeeded({
        conversationId: conversation.id,
        organizationId,
        connectionId,
        customerPhone: message.from,
      });

    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      throw error;
    }
  }

  /**
   * Busca conversa existente ou cria nova
   */
  private async getOrCreateConversation(params: {
    connectionId: string;
    customerPhone: string;
  }) {
    const { connectionId, customerPhone } = params;

    // Buscar conversa existente
    const existing = await this.conversationRepo.findByConnectionAndPhone(
      connectionId,
      customerPhone
    );

    if (existing) {
      return existing;
    }

    // Criar nova conversa
    return await this.conversationRepo.create({
      connection_id: connectionId,
      customer_phone: customerPhone,
      customer_name: customerPhone, // Temporário, pode ser atualizado depois
      status: 'open',
      unread_count: 0,
    });
  }

  /**
   * Envia mensagem de boas-vindas se for a primeira mensagem
   */
  private async sendWelcomeMessageIfNeeded(params: {
    conversationId: string;
    organizationId: string;
    connectionId: string;
    customerPhone: string;
  }): Promise<void> {
    const { conversationId, organizationId, connectionId, customerPhone } = params;

    // 1. Verificar se é primeira mensagem (apenas 1 mensagem na conversa)
    const messageCount = await this.messageRepo.countByConversation(conversationId);
    
    if (messageCount !== 1) {
      // Não é primeira mensagem
      return;
    }

    // 2. Buscar welcome_message da organização
    const organization = await this.orgRepo.findById(organizationId);
    
    if (!organization?.welcome_message) {
      // Não tem mensagem de boas-vindas configurada
      return;
    }

    // 3. Enviar mensagem de boas-vindas
    try {
      const wamid = await this.whatsappService.sendMessage({
        connectionId,
        to: `+${customerPhone}`,
        text: organization.welcome_message,
      });

      // 4. Salvar mensagem outbound no banco
      await this.messageRepo.create({
        conversation_id: conversationId,
        wamid,
        direction: 'outbound',
        type: 'text',
        content: organization.welcome_message,
        status: 'sent',
        is_ai_generated: false,
      });

      console.log('✅ Saudação automática enviada:', {
        conversationId,
        customerPhone,
      });

    } catch (error) {
      console.error('Erro ao enviar saudação automática:', error);
      // Não propagar erro - saudação é opcional
    }
  }
}

/**
 * Factory function
 */
export function getMessageProcessor(): MessageProcessor {
  return new MessageProcessor();
}
