/**
 * Organization Repository - Interface
 *
 * Este é o CONTRATO que define como interagir com organizações.
 * A implementação concreta pode ser Supabase, Prisma, outro DB, etc.
 *
 * Benefícios do Repository Pattern:
 * - Abstração: código não depende diretamente do Supabase
 * - Testabilidade: fácil mockar em testes
 * - Migração: trocar DB sem mudar código business logic
 */

import type { Database } from '@/types/database';
import type { Plan } from './plan';

export type Organization = Database['public']['Tables']['organizations']['Row'];
export type CreateOrganizationInput = Database['public']['Tables']['organizations']['Insert'];
export type UpdateOrganizationInput = Database['public']['Tables']['organizations']['Update'];

export type OrganizationWithPlan = Organization & {
  plan: Plan | null;
};

export interface OrganizationRepository {
  /**
   * Busca organização por ID
   */
  findById(id: string): Promise<Organization | null>;

  /**
   * Busca organização por slug
   */
  findBySlug(slug: string): Promise<Organization | null>;

  /**
   * Lista todas as organizações (para platform admins)
   */
  findAll(): Promise<Organization[]>;

  /**
   * Lista todas as organizações com dados do plano (para platform admins)
   */
  findAllWithPlan(): Promise<OrganizationWithPlan[]>;

  /**
   * Cria nova organização
   */
  create(data: CreateOrganizationInput): Promise<Organization>;

  /**
   * Atualiza organização
   */
  update(id: string, data: UpdateOrganizationInput): Promise<Organization>;

  /**
   * Deleta organização (soft delete)
   */
  delete(id: string): Promise<void>;
}
