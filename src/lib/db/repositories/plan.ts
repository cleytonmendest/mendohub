/**
 * Plan Repository - Interface
 *
 * Contrato para interagir com planos.
 */

import type { Database } from '@/types/database';

export type Plan = Database['public']['Tables']['plans']['Row'];

export interface PlanRepository {
  /**
   * Lista todos os planos ativos
   */
  findAllActive(): Promise<Plan[]>;

  /**
   * Busca plano por ID
   */
  findById(id: string): Promise<Plan | null>;

  /**
   * Busca plano por slug
   */
  findBySlug(slug: string): Promise<Plan | null>;
}
