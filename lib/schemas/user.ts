import { z } from 'zod';

/**
 * Login form validation schema
 * Validates superadmin authentication credentials
 * 
 * Validates Requirements:
 * - 1.1: Email and password fields for login
 * - 1.2: Credential validation
 * - 1.3: Invalid credential handling
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * User creation form validation schema
 * Validates data for creating new Phelbo platform users
 * 
 * Validates Requirements:
 * - 5.2: Required fields (email, full name, role)
 * - 5.5: Field-specific validation errors
 * - 6.3: Email format validation
 */
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  phoneNumber: z
    .string()
    .regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  role: z.enum(['Admin', 'Member', 'Guest'], {
    message: 'Role must be Admin, Member, or Guest',
  }),
});

/**
 * User update form validation schema
 * Validates data for updating existing user information
 * 
 * Validates Requirements:
 * - 6.3: Allow modification of name, email, phone number, and role
 * - 5.5: Field-specific validation errors
 */
export const updateUserSchema = z
  .object({
    email: z.string().email('Invalid email address').optional(),
    fullName: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .optional(),
    phoneNumber: z
      .string()
      .regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number')
      .optional()
      .or(z.literal('')),
    role: z
      .enum(['Admin', 'Member', 'Guest'], {
        message: 'Role must be Admin, Member, or Guest',
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

// Export TypeScript types derived from Zod schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

// Additional types for user role and status
export type UserRole = 'Admin' | 'Member' | 'Guest';
export type UserStatus = 'active' | 'deactivated';
