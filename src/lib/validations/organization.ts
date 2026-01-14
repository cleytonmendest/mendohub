/**
 * Organization Validation Schemas
 *
 * Schemas Zod para validação de organizações.
 */

import { z } from 'zod';

/**
 * Schema para criar nova organização
 */
export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),

  slug: z
    .string()
    .min(3, 'Slug deve ter no mínimo 3 caracteres')
    .max(50, 'Slug deve ter no máximo 50 caracteres')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug deve conter apenas letras minúsculas, números e hífens'
    )
    .trim(),

  plan_id: z.string().uuid('Plano inválido'),

  trial_days: z
    .number()
    .int()
    .min(0, 'Dias de trial não pode ser negativo')
    .max(365, 'Dias de trial não pode exceder 365')
    .optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

/**
 * Schema para atualizar organização
 */
export const updateOrganizationSchema = z.object({
  name: z.string().min(3).max(100).trim().optional(),
  plan_id: z.string().uuid().optional(),
  status: z.enum(['trial', 'active', 'suspended', 'cancelled']).optional(),
  timezone: z.string().optional(),
  welcome_message: z.string().optional(),
  out_of_hours_message: z.string().optional(),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
