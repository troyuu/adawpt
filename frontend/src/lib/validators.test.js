import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  registerSchema,
  reportSchema,
  adoptionApplicationSchema,
  donationSchema,
} from './validators'

describe('loginSchema', () => {
  it('validates correct login data', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'mypassword',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing email', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'mypassword',
    })
    expect(result.success).toBe(false)
    expect(result.error.issues[0].message).toContain('Email is required')
  })

  it('rejects invalid email format', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'mypassword',
    })
    expect(result.success).toBe(false)
    expect(result.error.issues[0].message).toContain('valid email')
  })

  it('rejects missing password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
    expect(result.error.issues[0].message).toContain('Password is required')
  })
})

describe('registerSchema', () => {
  const validData = {
    full_name: 'John Doe',
    email: 'john@example.com',
    password: 'Password1',
    password_confirm: 'Password1',
  }

  it('validates correct registration data', () => {
    const result = registerSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejects name shorter than 2 characters', () => {
    const result = registerSchema.safeParse({ ...validData, full_name: 'J' })
    expect(result.success).toBe(false)
    expect(result.error.issues.some((i) => i.path.includes('full_name'))).toBe(true)
  })

  it('rejects name longer than 100 characters', () => {
    const result = registerSchema.safeParse({ ...validData, full_name: 'A'.repeat(101) })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({ ...validData, email: 'bademail' })
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'Pass1',
      password_confirm: 'Pass1',
    })
    expect(result.success).toBe(false)
    expect(result.error.issues.some((i) => i.path.includes('password'))).toBe(true)
  })

  it('rejects password without uppercase letter', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'password1',
      password_confirm: 'password1',
    })
    expect(result.success).toBe(false)
  })

  it('rejects password without lowercase letter', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'PASSWORD1',
      password_confirm: 'PASSWORD1',
    })
    expect(result.success).toBe(false)
  })

  it('rejects password without a number', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'PasswordOnly',
      password_confirm: 'PasswordOnly',
    })
    expect(result.success).toBe(false)
  })

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password_confirm: 'DifferentPass1',
    })
    expect(result.success).toBe(false)
    expect(result.error.issues.some((i) => i.message === 'Passwords do not match')).toBe(true)
  })

  it('allows optional phone field', () => {
    const result = registerSchema.safeParse({ ...validData, phone: '555-0123' })
    expect(result.success).toBe(true)
  })
})

describe('reportSchema', () => {
  const validReport = {
    title: 'Found injured dog',
    description: 'A dog was found injured near the park entrance, needs immediate help.',
    species: 'dog',
    urgency: 'high',
    latitude: 40.7128,
    longitude: -74.006,
  }

  it('validates correct report data', () => {
    const result = reportSchema.safeParse(validReport)
    expect(result.success).toBe(true)
  })

  it('rejects title shorter than 5 characters', () => {
    const result = reportSchema.safeParse({ ...validReport, title: 'Hi' })
    expect(result.success).toBe(false)
  })

  it('rejects title longer than 200 characters', () => {
    const result = reportSchema.safeParse({ ...validReport, title: 'A'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('rejects description shorter than 20 characters', () => {
    const result = reportSchema.safeParse({ ...validReport, description: 'Too short.' })
    expect(result.success).toBe(false)
  })

  it('rejects description longer than 2000 characters', () => {
    const result = reportSchema.safeParse({ ...validReport, description: 'A'.repeat(2001) })
    expect(result.success).toBe(false)
  })

  it('rejects empty species', () => {
    const result = reportSchema.safeParse({ ...validReport, species: '' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid urgency level', () => {
    const result = reportSchema.safeParse({ ...validReport, urgency: 'extreme' })
    expect(result.success).toBe(false)
  })

  it('accepts all valid urgency levels', () => {
    for (const urgency of ['low', 'medium', 'high', 'critical']) {
      const result = reportSchema.safeParse({ ...validReport, urgency })
      expect(result.success).toBe(true)
    }
  })

  it('rejects latitude out of range', () => {
    const result = reportSchema.safeParse({ ...validReport, latitude: 91 })
    expect(result.success).toBe(false)
  })

  it('rejects longitude out of range', () => {
    const result = reportSchema.safeParse({ ...validReport, longitude: 181 })
    expect(result.success).toBe(false)
  })

  it('allows optional address, contact_name, and contact_phone', () => {
    const result = reportSchema.safeParse({
      ...validReport,
      address: '123 Main St',
      contact_name: 'John',
      contact_phone: '555-1234',
    })
    expect(result.success).toBe(true)
  })

  it('allows empty string for contact_name and contact_phone', () => {
    const result = reportSchema.safeParse({
      ...validReport,
      contact_name: '',
      contact_phone: '',
    })
    expect(result.success).toBe(true)
  })
})

describe('adoptionApplicationSchema', () => {
  const validApplication = {
    animal_id: '123',
    reason: 'I have always wanted a pet and I can provide a loving home with a big yard.',
    living_situation: 'House with backyard',
    has_other_pets: false,
    has_yard: true,
    experience: '5 years with dogs',
    household_members: 3,
    agree_to_terms: true,
  }

  it('validates correct application data', () => {
    const result = adoptionApplicationSchema.safeParse(validApplication)
    expect(result.success).toBe(true)
  })

  it('accepts numeric animal_id', () => {
    const result = adoptionApplicationSchema.safeParse({ ...validApplication, animal_id: 42 })
    expect(result.success).toBe(true)
  })

  it('rejects empty animal_id', () => {
    const result = adoptionApplicationSchema.safeParse({ ...validApplication, animal_id: '' })
    expect(result.success).toBe(false)
  })

  it('rejects reason shorter than 20 characters', () => {
    const result = adoptionApplicationSchema.safeParse({ ...validApplication, reason: 'Too short' })
    expect(result.success).toBe(false)
  })

  it('rejects reason longer than 2000 characters', () => {
    const result = adoptionApplicationSchema.safeParse({
      ...validApplication,
      reason: 'A'.repeat(2001),
    })
    expect(result.success).toBe(false)
  })

  it('requires living_situation', () => {
    const result = adoptionApplicationSchema.safeParse({
      ...validApplication,
      living_situation: '',
    })
    expect(result.success).toBe(false)
  })

  it('requires experience', () => {
    const result = adoptionApplicationSchema.safeParse({
      ...validApplication,
      experience: '',
    })
    expect(result.success).toBe(false)
  })

  it('requires at least 1 household member', () => {
    const result = adoptionApplicationSchema.safeParse({
      ...validApplication,
      household_members: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects more than 20 household members', () => {
    const result = adoptionApplicationSchema.safeParse({
      ...validApplication,
      household_members: 21,
    })
    expect(result.success).toBe(false)
  })

  it('requires agreement to terms', () => {
    const result = adoptionApplicationSchema.safeParse({
      ...validApplication,
      agree_to_terms: false,
    })
    expect(result.success).toBe(false)
  })
})

describe('donationSchema', () => {
  const validDonation = {
    amount: 50,
    type: 'one_time',
  }

  it('validates correct donation data', () => {
    const result = donationSchema.safeParse(validDonation)
    expect(result.success).toBe(true)
  })

  it('rejects amount less than 1', () => {
    const result = donationSchema.safeParse({ ...validDonation, amount: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects amount greater than 100000', () => {
    const result = donationSchema.safeParse({ ...validDonation, amount: 100001 })
    expect(result.success).toBe(false)
  })

  it('rejects non-numeric amount', () => {
    const result = donationSchema.safeParse({ ...validDonation, amount: 'fifty' })
    expect(result.success).toBe(false)
  })

  it('accepts all valid donation types', () => {
    for (const type of ['one_time', 'monthly', 'sponsorship']) {
      const result = donationSchema.safeParse({ ...validDonation, type })
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid donation type', () => {
    const result = donationSchema.safeParse({ ...validDonation, type: 'yearly' })
    expect(result.success).toBe(false)
  })

  it('allows optional message', () => {
    const result = donationSchema.safeParse({
      ...validDonation,
      message: 'Keep up the good work!',
    })
    expect(result.success).toBe(true)
  })

  it('rejects message longer than 500 characters', () => {
    const result = donationSchema.safeParse({
      ...validDonation,
      message: 'A'.repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it('allows empty string for message', () => {
    const result = donationSchema.safeParse({
      ...validDonation,
      message: '',
    })
    expect(result.success).toBe(true)
  })

  it('allows optional anonymous field', () => {
    const result = donationSchema.safeParse({
      ...validDonation,
      anonymous: true,
    })
    expect(result.success).toBe(true)
  })
})
