/**
 * Plan Repository - Supabase Implementation
 */

import { createAdminClient } from '../admin';
import type { Plan, PlanRepository } from '../../repositories/plan';

export class SupabasePlanRepository implements PlanRepository {
  async findAllActive(): Promise<Plan[]> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to list plans: ${error.message}`);
    }

    return data;
  }

  async findById(id: string): Promise<Plan | null> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find plan: ${error.message}`);
    }

    return data;
  }

  async findBySlug(slug: string): Promise<Plan | null> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find plan: ${error.message}`);
    }

    return data;
  }
}

/**
 * Factory function para obter o repository de plans
 */
export function getPlanRepository(): PlanRepository {
  return new SupabasePlanRepository();
}
