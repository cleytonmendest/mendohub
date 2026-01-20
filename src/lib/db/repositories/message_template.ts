/**
 * Message Template Repository - Interface
 *
 * Define o contrato para interagir com templates de mensagens.
 */

import type { Database } from '@/types/database';

export type MessageTemplate =
  Database['public']['Tables']['message_templates']['Row'];
export type CreateMessageTemplateInput =
  Database['public']['Tables']['message_templates']['Insert'];
export type UpdateMessageTemplateInput =
  Database['public']['Tables']['message_templates']['Update'];

export interface MessageTemplateRepository {
  /**
   * Lista templates de uma organização
   */
  findByOrganizationId(
    organizationId: string,
    options?: {
      category?: string;
    }
  ): Promise<MessageTemplate[]>;

  /**
   * Busca template por shortcut
   * Usado para inserção rápida via teclado
   */
  findByShortcut(
    organizationId: string,
    shortcut: string
  ): Promise<MessageTemplate | null>;

  /**
   * Busca template por ID
   */
  findById(id: string): Promise<MessageTemplate | null>;

  /**
   * Cria template
   */
  create(data: CreateMessageTemplateInput): Promise<MessageTemplate>;

  /**
   * Atualiza template
   */
  update(
    id: string,
    data: UpdateMessageTemplateInput
  ): Promise<MessageTemplate>;

  /**
   * Incrementa contador de uso
   */
  incrementUsage(id: string): Promise<void>;

  /**
   * Soft delete
   */
  delete(id: string): Promise<void>;
}
