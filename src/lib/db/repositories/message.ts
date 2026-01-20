/**
 * Message Repository - Interface
 *
 * Define o contrato para interagir com mensagens.
 */

import type { Database } from '@/types/database';

export type Message = Database['public']['Tables']['messages']['Row'];
export type CreateMessageInput =
  Database['public']['Tables']['messages']['Insert'];
export type UpdateMessageInput =
  Database['public']['Tables']['messages']['Update'];

export interface MessageRepository {
  /**
   * Lista mensagens de uma conversa (ordem cronológica)
   */
  findByConversationId(
    conversationId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<Message[]>;

  /**
   * Busca mensagem por ID
   */
  findById(id: string): Promise<Message | null>;

  /**
   * Busca mensagem por WAMID (WhatsApp Message ID)
   * Usado para check de idempotency no webhook
   */
  findByWamid(wamid: string): Promise<Message | null>;

  /**
   * Cria mensagem
   * Trigger increment_conversation_counters() executa automaticamente
   */
  create(data: CreateMessageInput): Promise<Message>;

  /**
   * Atualiza status da mensagem (sent → delivered → read)
   */
  updateStatus(
    id: string,
    status: 'sent' | 'delivered' | 'read'
  ): Promise<Message>;

  /**
   * Atualiza mensagem de erro
   */
  updateError(id: string, errorMessage: string): Promise<Message>;
}
