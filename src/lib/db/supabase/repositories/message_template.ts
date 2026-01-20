/**
 * Message Template Repository - Supabase Implementation
 *
 * IMPORTANTE:
 * - Soft delete (deleted_at não null)
 * - Usage tracking (usage_count, last_used_at)
 */

import { createClient as createServerClient } from '../server';
import type {
  MessageTemplate,
  MessageTemplateRepository,
  CreateMessageTemplateInput,
  UpdateMessageTemplateInput,
} from '../../repositories/message_template';

export class SupabaseMessageTemplateRepository
  implements MessageTemplateRepository
{
  async findByOrganizationId(
    organizationId: string,
    options?: {
      category?: string;
    }
  ): Promise<MessageTemplate[]> {
    const supabase = await createServerClient();

    let query = supabase
      .from('message_templates')
      .select('*')
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .order('name', { ascending: true });

    if (options?.category) {
      query = query.eq('category', options.category);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(
        `Failed to list message templates: ${error.message}`
      );
    }

    return data;
  }

  async findByShortcut(
    organizationId: string,
    shortcut: string
  ): Promise<MessageTemplate | null> {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('shortcut', shortcut)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(
        `Failed to find message template by shortcut: ${error.message}`
      );
    }

    return data;
  }

  async findById(id: string): Promise<MessageTemplate | null> {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(
        `Failed to find message template: ${error.message}`
      );
    }

    return data;
  }

  async create(
    data: CreateMessageTemplateInput
  ): Promise<MessageTemplate> {
    const supabase = await createServerClient();

    // Type cast needed: Supabase RLS policies cause type mismatch
    const { data: template, error } = (await supabase
      .from('message_templates')
      .insert(data as any)
      .select()
      .single()) as { data: MessageTemplate | null; error: any };

    if (error) {
      throw new Error(
        `Failed to create message template: ${error.message}`
      );
    }

    if (!template) {
      throw new Error(
        'Failed to create message template: No data returned'
      );
    }

    return template;
  }

  async update(
    id: string,
    data: UpdateMessageTemplateInput
  ): Promise<MessageTemplate> {
    const supabase = await createServerClient();

    // Type cast needed: Supabase RLS policies cause type mismatch
    const supabaseTable: any = supabase.from('message_templates');
    const query: any = supabaseTable
      .update(data)
      .eq('id', id)
      .select()
      .single();

    const { data: template, error } = await query;

    if (error) {
      throw new Error(
        `Failed to update message template: ${error.message}`
      );
    }

    if (!template) {
      throw new Error(
        'Failed to update message template: No data returned'
      );
    }

    return template;
  }

  async incrementUsage(id: string): Promise<void> {
    const supabase = await createServerClient();

    // Get current usage count
    const { data: template } = (await supabase
      .from('message_templates')
      .select('usage_count')
      .eq('id', id)
      .single()) as { data: { usage_count: number } | null; error: any };

    const currentCount = template?.usage_count ?? 0;

    // Increment usage count
    // Type cast needed: Supabase RLS policies cause type mismatch
    const supabaseTable: any = supabase.from('message_templates');
    const { error } = await supabaseTable
      .update({
        usage_count: currentCount + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new Error(
        `Failed to increment template usage: ${error.message}`
      );
    }
  }

  async delete(id: string): Promise<void> {
    const supabase = await createServerClient();

    // Type cast needed: Supabase RLS policies cause type mismatch
    const supabaseTable: any = supabase.from('message_templates');
    const { error } = await supabaseTable
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(
        `Failed to delete message template: ${error.message}`
      );
    }
  }
}

/**
 * Factory function para obter o repository
 */
export function getMessageTemplateRepository(): MessageTemplateRepository {
  return new SupabaseMessageTemplateRepository();
}
