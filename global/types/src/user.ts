import zod from 'zod'

export const UserSchema = zod.object({
  id: zod.string(),
  email: zod
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/i, 'Invalid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(255),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
})

export type UserType = zod.infer<typeof UserSchema>

// Creation schemas
export const CreationUserSchema = UserSchema.omit({
  id: true,
}).extend({
  confirmPassword: zod.string().min(6, 'Password must be at least 6 characters'),
  withGoogle: zod.boolean().optional(),
})

export type CreationUserType = zod.infer<typeof CreationUserSchema>

export const LoginUserSchema = UserSchema.omit({
  id: true,
}).extend({
  withGoogle: zod.boolean().optional(),
})

export type LoginUserType = zod.infer<typeof LoginUserSchema>
