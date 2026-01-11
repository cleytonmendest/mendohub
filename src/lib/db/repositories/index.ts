/**
 * Repositories - Barrel Export
 *
 * Exporta todos os repositories em um único lugar.
 *
 * Uso:
 * import { getOrganizationRepository } from '@/lib/db/repositories';
 */

export * from './organization';
export { getOrganizationRepository } from '../supabase/repositories/organization';
