/**
 * WhatsApp Connection Repository - Supabase Implementation
 *
 * IMPORTANTE:
 * - Usa createClient() do server.ts (RLS aplicado)
 * - RLS permite users ver apenas conexões da sua organização
 */

import { createClient as createServerClient } from '../server';
import type {
  WhatsAppConnection,
  WhatsAppConnectionRepository,
  CreateWhatsAppConnectionInput,
  UpdateWhatsAppConnectionInput,
} from '../../repositories/whatsapp_connection';

export class SupabaseWhatsAppConnectionRepository
  implements WhatsAppConnectionRepository
{
  async findById(id: string): Promise<WhatsAppConnection | null> {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('whatsapp_connections')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to find WhatsApp connection: ${error.message}`);
    }

    return data;
  }

  async findByOrganizationId(
    organizationId: string
  ): Promise<WhatsAppConnection[]> {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('whatsapp_connections')
      .select('*')
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(
        `Failed to list WhatsApp connections: ${error.message}`
      );
    }

    return data;
  }

  async findByPhoneNumberId(
    phoneNumberId: string
  ): Promise<WhatsAppConnection | null> {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('whatsapp_connections')
      .select('*')
      .eq('phone_number_id', phoneNumberId)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find WhatsApp connection: ${error.message}`);
    }

    return data;
  }

  async create(
    data: CreateWhatsAppConnectionInput
  ): Promise<WhatsAppConnection> {
    const supabase = await createServerClient();

    // Type cast needed: Supabase RLS policies cause type mismatch
    const { data: connection, error } = await (supabase
      .from('whatsapp_connections')
      .insert(data as any)
      .select()
      .single() as unknown as Promise<{ data: WhatsAppConnection | null; error: any }>);

    if (error) {
      throw new Error(`Failed to create WhatsApp connection: ${error.message}`);
    }

    if (!connection) {
      throw new Error('Failed to create WhatsApp connection: No data returned');
    }

    return connection;
  }

  async update(
    id: string,
    data: UpdateWhatsAppConnectionInput
  ): Promise<WhatsAppConnection> {
    const supabase = await createServerClient();

    // Type cast needed: Supabase RLS policies cause type mismatch
    const supabaseTable: any = supabase.from('whatsapp_connections');
    const query: any = supabaseTable
      .update(data)
      .eq('id', id)
      .select()
      .single();

    const { data: connection, error } = await query;

    if (error) {
      throw new Error(`Failed to update WhatsApp connection: ${error.message}`);
    }

    if (!connection) {
      throw new Error('Failed to update WhatsApp connection: No data returned');
    }

    return connection;
  }

  async delete(id: string): Promise<void> {
    const supabase = await createServerClient();

    // Type cast needed: Supabase RLS policies cause type mismatch
    const supabaseTable: any = supabase.from('whatsapp_connections');
    const query: any = supabaseTable
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    const { error } = await query;

    if (error) {
      throw new Error(`Failed to delete WhatsApp connection: ${error.message}`);
    }
  }
}

/**
 * Factory function para obter o repository
 */
export function getWhatsAppConnectionRepository(): WhatsAppConnectionRepository {
  return new SupabaseWhatsAppConnectionRepository();
}
