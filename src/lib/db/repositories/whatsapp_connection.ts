/**
 * WhatsApp Connection Repository - Interface
 *
 * Define o contrato para interagir com conexões WhatsApp.
 */

import type { Database } from '@/types/database';

export type WhatsAppConnection =
  Database['public']['Tables']['whatsapp_connections']['Row'];
export type CreateWhatsAppConnectionInput =
  Database['public']['Tables']['whatsapp_connections']['Insert'];
export type UpdateWhatsAppConnectionInput =
  Database['public']['Tables']['whatsapp_connections']['Update'];

export interface WhatsAppConnectionRepository {
  /**
   * Busca conexão por ID
   */
  findById(id: string): Promise<WhatsAppConnection | null>;

  /**
   * Busca todas as conexões de uma organização
   */
  findByOrganizationId(organizationId: string): Promise<WhatsAppConnection[]>;

  /**
   * Busca conexão ativa de uma organização por phone_number_id
   */
  findByPhoneNumberId(phoneNumberId: string): Promise<WhatsAppConnection | null>;

  /**
   * Cria nova conexão WhatsApp
   */
  create(data: CreateWhatsAppConnectionInput): Promise<WhatsAppConnection>;

  /**
   * Atualiza conexão WhatsApp
   */
  update(
    id: string,
    data: UpdateWhatsAppConnectionInput
  ): Promise<WhatsAppConnection>;

  /**
   * Deleta conexão (soft delete)
   */
  delete(id: string): Promise<void>;
}
