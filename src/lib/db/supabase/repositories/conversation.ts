/**
 * Conversation Repository - Supabase Implementation
 *
 * IMPORTANTE:
 * - Usa createClient() do server.ts (RLS aplicado)
 * - RLS permite users ver apenas conversas da sua organização
 * - Filtragem por org via JOIN com whatsapp_connections
 */

import { createClient as createServerClient } from '../server';
import type {
  Conversation,
  ConversationWithOrg,
  ConversationRepository,
  CreateConversationInput,
  UpdateConversationInput,
} from '../../repositories/conversation';

export class SupabaseConversationRepository
  implements ConversationRepository
{
  async findByOrganizationId(
    organizationId: string,
    options?: {
      status?: 'open' | 'assigned' | 'resolved' | 'closed';
      assignedTo?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<Conversation[]> {
    const supabase = await createServerClient();

    // PASSO 1: Buscar connection_ids da organização
    const { data: connections, error: connectionsError } = await supabase
      .from('whatsapp_connections')
      .select('id')
      .eq('organization_id', organizationId);

    if (connectionsError) {
      throw new Error(
        `Failed to fetch connections: ${connectionsError.message}`
      );
    }

    // Se não tem connections, retorna vazio
    if (!connections || connections.length === 0) {
      return [];
    }

    const connectionIds = connections.map((c: { id: string }) => c.id);

    // PASSO 2: Buscar conversations com esses connection_ids
    let query = supabase
      .from('conversations')
      .select('*')
      .in('connection_id', connectionIds)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    // Apply filters
    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.assignedTo) {
      query = query.eq('assigned_to', options.assignedTo);
    }

    // Apply pagination
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      throw new Error(
        `Failed to list conversations: ${error.message}`
      );
    }

    return data as Conversation[];
  }

  async findById(id: string): Promise<ConversationWithOrg | null> {
    const supabase = await createServerClient();

    // Buscar conversation
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to find conversation: ${error.message}`);
    }

    if (!conversation) {
      return null;
    }

    // Buscar organization_id via connection
    const { data: connection, error: connectionError } = await supabase
      .from('whatsapp_connections')
      .select('organization_id')
      .eq('id', (conversation as Conversation).connection_id)
      .single();

    if (connectionError || !connection) {
      throw new Error(
        `Failed to find connection: ${connectionError?.message || 'Connection not found'}`
      );
    }

    // Retornar conversation + organization_id
    return {
      ...(conversation as Conversation),
      organization_id: (connection as { organization_id: string }).organization_id,
    } as ConversationWithOrg;
  }

  async findByConnectionAndPhone(
    connectionId: string,
    customerPhone: string
  ): Promise<Conversation | null> {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('connection_id', connectionId)
      .eq('customer_phone', customerPhone)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find conversation: ${error.message}`);
    }

    return data;
  }

  async create(
    data: CreateConversationInput
  ): Promise<Conversation> {
    const supabase = await createServerClient();

    // Type cast needed: Supabase RLS policies cause type mismatch
    const { data: conversation, error } = (await supabase
      .from('conversations')
      .insert(data as any)
      .select()
      .single()) as { data: Conversation | null; error: any };

    if (error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }

    if (!conversation) {
      throw new Error(
        'Failed to create conversation: No data returned'
      );
    }

    return conversation;
  }

  async update(
    id: string,
    data: UpdateConversationInput
  ): Promise<Conversation> {
    const supabase = await createServerClient();

    // Type cast needed: Supabase RLS policies cause type mismatch
    const supabaseTable: any = supabase.from('conversations');
    const query: any = supabaseTable
      .update(data)
      .eq('id', id)
      .select()
      .single();

    const { data: conversation, error } = await query;

    if (error) {
      throw new Error(`Failed to update conversation: ${error.message}`);
    }

    if (!conversation) {
      throw new Error(
        'Failed to update conversation: No data returned'
      );
    }

    return conversation;
  }

  async markAsRead(id: string): Promise<void> {
    const supabase = await createServerClient();

    // Type cast needed: Supabase RLS policies cause type mismatch
    const supabaseTable: any = supabase.from('conversations');
    const { error } = await supabaseTable
      .update({ unread_count: 0 })
      .eq('id', id);

    if (error) {
      throw new Error(
        `Failed to mark conversation as read: ${error.message}`
      );
    }
  }
}

/**
 * Factory function para obter o repository
 */
export function getConversationRepository(): ConversationRepository {
  return new SupabaseConversationRepository();
}
