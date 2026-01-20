/**
 * Conversation Repository - Interface
 *
 * Define o contrato para interagir com conversas do inbox.
 */

import type { Database } from '@/types/database';

export type Conversation =
  Database['public']['Tables']['conversations']['Row'];
export type CreateConversationInput =
  Database['public']['Tables']['conversations']['Insert'];
export type UpdateConversationInput =
  Database['public']['Tables']['conversations']['Update'];

// Extended type with organization_id from whatsapp_connections JOIN
export type ConversationWithOrg = Conversation & {
  organization_id: string;
};

export interface ConversationRepository {
  /**
   * Lista conversas de uma organização (via whatsapp_connections)
   *
   * @param organizationId - ID da organização
   * @param options - Filtros e paginação
   */
  findByOrganizationId(
    organizationId: string,
    options?: {
      status?: 'open' | 'assigned' | 'resolved' | 'closed';
      assignedTo?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<Conversation[]>;

  /**
   * Busca conversa por ID
   * Retorna com organization_id via JOIN com whatsapp_connections
   */
  findById(id: string): Promise<ConversationWithOrg | null>;

  /**
   * Busca conversa por conexão + telefone do cliente
   * Usado no webhook para find or create
   */
  findByConnectionAndPhone(
    connectionId: string,
    customerPhone: string
  ): Promise<Conversation | null>;

  /**
   * Cria nova conversa
   */
  create(data: CreateConversationInput): Promise<Conversation>;

  /**
   * Atualiza conversa (assign, status, tags)
   */
  update(
    id: string,
    data: UpdateConversationInput
  ): Promise<Conversation>;

  /**
   * Marca conversa como lida (reset unread_count)
   */
  markAsRead(id: string): Promise<void>;
}
