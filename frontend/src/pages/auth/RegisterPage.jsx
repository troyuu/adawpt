import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserPlus, PawPrint } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Alert from '../../components/ui/Alert.jsx'

const registerSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
    last_name: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [serverError, setServerError] = useState(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirm_password: '',
    },
  })

  async function onSubmit(values) {
    setServerError(null)
    try {
      const { confirm_password, ...payload } = values
      await registerUser(payload)
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data
      if (data?.errors && typeof data.errors === 'object') {
        // Map field-level errors to their respective form inputs
        const fieldErrorMap = {
          email: 'This email is already registered. Please use a different email or log in.',
        }
        let hasFieldError = false
        for (const [field, messages] of Object.entries(data.errors)) {
          if (['email', 'first_name', 'last_name', 'password'].includes(field)) {
            setError(field, {
              type: 'server',
              message: fieldErrorMap[field] || (Array.isArray(messages) ? messages[0] : messages),
            })
            hasFieldError = true
          }
        }
        if (!hasFieldError) {
          const messages = Object.values(data.errors).flat().join(' ')
          setServerError(messages)
        }
      } else {
        setServerError(
          data?.message || data?.detail || 'Registration failed. Please try again.'
        )
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 mb-4">
            <PawPrint className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-display text-gray-900">
            Create your account
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Join Adawpt and make a difference
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          {serverError && (
            <Alert variant="error" onClose={() => setServerError(null)} className="mb-4">
              {serverError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="first_name"
                label="First Name"
                placeholder="John"
                autoComplete="given-name"
                error={errors.first_name?.message}
                {...register('first_name')}
              />
              <Input
                id="last_name"
                label="Last Name"
                placeholder="Doe"
                autoComplete="family-name"
                error={errors.last_name?.message}
                {...register('last_name')}
              />
            </div>

            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              id="confirm_password"
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              error={errors.confirm_password?.message}
              {...register('confirm_password')}
            />

            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full"
            >
              <UserPlus className="h-4 w-4" />
              Register
            </Button>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary hover:text-primary-hover font-medium transition-colors"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
