import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    password_confirm: z
      .string()
      .min(1, 'Please confirm your password'),
    phone: z
      .string()
      .optional(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  })

export const reportSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  species: z
    .string()
    .min(1, 'Please select a species'),
  urgency: z
    .enum(['low', 'medium', 'high', 'critical'], {
      required_error: 'Please select urgency level',
    }),
  latitude: z
    .number({ invalid_type_error: 'Location is required' })
    .min(-90)
    .max(90),
  longitude: z
    .number({ invalid_type_error: 'Location is required' })
    .min(-180)
    .max(180),
  address: z
    .string()
    .optional(),
  contact_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .optional()
    .or(z.literal('')),
  contact_phone: z
    .string()
    .optional()
    .or(z.literal('')),
})

export const adoptionApplicationSchema = z.object({
  animal_id: z
    .string()
    .or(z.number())
    .refine((val) => val !== '' && val != null, 'Animal is required'),
  reason: z
    .string()
    .min(20, 'Please provide at least 20 characters explaining why you want to adopt')
    .max(2000, 'Reason must be less than 2000 characters'),
  living_situation: z
    .string()
    .min(1, 'Please describe your living situation'),
  has_other_pets: z
    .boolean(),
  other_pets_details: z
    .string()
    .optional()
    .or(z.literal('')),
  has_yard: z
    .boolean(),
  experience: z
    .string()
    .min(1, 'Please describe your experience with pets'),
  household_members: z
    .number({ invalid_type_error: 'Please enter the number of household members' })
    .min(1, 'Must have at least 1 household member')
    .max(20),
  agree_to_terms: z
    .boolean()
    .refine((val) => val === true, 'You must agree to the terms'),
})

export const donationSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Please enter a valid amount' })
    .min(1, 'Minimum donation is $1')
    .max(100000, 'Maximum donation is $100,000'),
  type: z
    .enum(['one_time', 'monthly', 'sponsorship'], {
      required_error: 'Please select a donation type',
    }),
  message: z
    .string()
    .max(500, 'Message must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  anonymous: z
    .boolean()
    .optional(),
})
