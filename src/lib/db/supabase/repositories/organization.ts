/**
 * Organization Repository - Supabase Implementation
 *
 * Implementação concreta usando Supabase.
 *
 * IMPORTANTE:
 * - Usa createClient() do server.ts (RLS aplicado)
 * - Para operações admin, use createAdminClient() do admin.ts
 */

import { createClient as createServerClient } from '../server';
import { createAdminClient } from '../admin';
import type {
  Organization,
  OrganizationRepository,
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from '../../repositories/organization';

export class SupabaseOrganizationRepository implements OrganizationRepository {
  async findById(id: string): Promise<Organization | null> {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to find organization: ${error.message}`);
    }

    return data;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find organization: ${error.message}`);
    }

    return data;
  }

  async findAll(): Promise<Organization[]> {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to list organizations: ${error.message}`);
    }

    return data;
  }

  async create(input: CreateOrganizationInput): Promise<Organization> {
    // Usar admin client para criar organizações (geralmente feito por platform admins)
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('organizations')
      .insert(input)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create organization: ${error.message}`);
    }

    return data;
  }

  async update(
    id: string,
    input: UpdateOrganizationInput
  ): Promise<Organization> {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('organizations')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update organization: ${error.message}`);
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('organizations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete organization: ${error.message}`);
    }
  }
}

/**
 * Factory function para obter o repository de organizations
 *
 * Use esta função em vez de instanciar diretamente:
 * const orgRepo = getOrganizationRepository();
 * const org = await orgRepo.findBySlug('acme');
 */
export function getOrganizationRepository(): OrganizationRepository {
  return new SupabaseOrganizationRepository();
}
