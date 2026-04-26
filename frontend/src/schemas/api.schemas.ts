import { z } from 'zod';

/**
 * Zod schemas for runtime validation of API responses.
 * Prevents type confusion and ensures data integrity.
 */

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  roleCode: z.string(),
  companyId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

export const LoginResponseSchema = z.object({
  user: UserSchema,
});

export const CompanySchema = z.object({
  id: z.string().uuid(),
  legalName: z.string().min(1),
  ruc: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  sector: z.string().optional(),
  isActive: z.boolean(),
});

export const AreaSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  companyId: z.string().uuid(),
  isActive: z.boolean(),
});

export const ProcessSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  areaId: z.string().uuid(),
  companyId: z.string().uuid(),
  isActive: z.boolean(),
});

export const ApiErrorSchema = z.object({
  statusCode: z.number().optional(),
  message: z.string(),
  error: z.string().optional(),
});

/**
 * Validates an API response against a Zod schema.
 * Returns the parsed data or throws a descriptive error.
 */
export function validateApiResponse<T>(schema: z.ZodSchema<T>, data: unknown, endpoint: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[API Validation] Response from ${endpoint} does not match schema:`, result.error.flatten());
    throw new Error(`Respuesta inválida del servidor en ${endpoint}`);
  }
  return result.data;
}
