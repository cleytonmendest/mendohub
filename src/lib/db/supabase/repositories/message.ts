/**
 * Message Repository - Supabase Implementation
 *
 * IMPORTANTE:
 * - Trigger increment_conversation_counters() executa automaticamente no INSERT
 * - Index (conversation_id, created_at DESC) otimiza queries
 * - WAMID é único (previne duplicatas)
 */

import { createClient as createServerClient } from '../server';
import type {
  Message,
  MessageRepository,
  CreateMessageInput,
  UpdateMessageInput,
} from '../../repositories/message';

export class SupabaseMessageRepository implements MessageRepository {
  async findByConversationId(
    conversationId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<Message[]> {
    const supabase = await createServerClient();

    const limit = options?.limit ?? 100;
    const offset = options?.offset ?? 0;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true }) // Chronological order
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to list messages: ${error.message}`);
    }

    return data;
  }

  async findById(id: string): Promise<Message | null> {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find message: ${error.message}`);
    }

    return data;
  }

  async findByWamid(wamid: string): Promise<Message | null> {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('wamid', wamid)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find message by WAMID: ${error.message}`);
    }

    return data;
  }

  async create(data: CreateMessageInput): Promise<Message> {
    const supabase = await createServerClient();

    // Type cast needed: Supabase RLS policies cause type mismatch
    const { data: message, error } = (await supabase
      .from('messages')
      .insert(data as any)
      .select()
      .single()) as { data: Message | null; error: any };

    if (error) {
      throw new Error(`Failed to create message: ${error.message}`);
    }

    if (!message) {
      throw new Error('Failed to create message: No data returned');
    }

    return message;
  }

  async updateStatus(
    id: string,
    status: 'sent' | 'delivered' | 'read'
  ): Promise<Message> {
    const supabase = await createServerClient();

    const updates: UpdateMessageInput = { status };

    // Add timestamp for status changes
    if (status === 'delivered') {
      updates.delivered_at = new Date().toISOString();
    } else if (status === 'read') {
      updates.read_at = new Date().toISOString();
    }

    // Type cast needed: Supabase RLS policies cause type mismatch
    const supabaseTable: any = supabase.from('messages');
    const query: any = supabaseTable
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    const { data: message, error } = await query;

    if (error) {
      throw new Error(`Failed to update message status: ${error.message}`);
    }

    if (!message) {
      throw new Error(
        'Failed to update message status: No data returned'
      );
    }

    return message;
  }

  async updateError(id: string, errorMessage: string): Promise<Message> {
    const supabase = await createServerClient();

    // Type cast needed: Supabase RLS policies cause type mismatch
    const supabaseTable: any = supabase.from('messages');
    const query: any = supabaseTable
      .update({ error_message: errorMessage })
      .eq('id', id)
      .select()
      .single();

    const { data: message, error } = await query;

    if (error) {
      throw new Error(`Failed to update message error: ${error.message}`);
    }

    if (!message) {
      throw new Error(
        'Failed to update message error: No data returned'
      );
    }

    return message;
  }

  async countByConversation(conversationId: string): Promise<number> {
    const supabase = await createServerClient();

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId);

    if (error) {
      throw new Error(`Failed to count messages: ${error.message}`);
    }

    return count || 0;
  }
}

/**
 * Factory function para obter o repository
 */
export function getMessageRepository(): MessageRepository {
  return new SupabaseMessageRepository();
}
