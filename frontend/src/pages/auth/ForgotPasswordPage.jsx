import { useState } from 'react'
import { Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Mail, Send } from 'lucide-react'
import api from '../../api/client.js'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Alert from '../../components/ui/Alert.jsx'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
})

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  async function onSubmit(values) {
    setServerError(null)
    try {
      await api.post('/api/v1/auth/password/reset/', { email: values.email })
      setSubmitted(true)
    } catch (err) {
      // Still show success to avoid email enumeration, but allow for network errors
      if (err.response?.status >= 500) {
        setServerError('Something went wrong. Please try again later.')
      } else {
        setSubmitted(true)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 mb-4">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-display text-gray-900">
            Forgot your password?
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          {submitted ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-success/10 mb-4">
                <Mail className="h-6 w-6 text-success" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 font-display">
                Check your email
              </h2>
              <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                If an account exists for <span className="font-medium text-gray-700">{getValues('email')}</span>,
                you will receive a password reset link shortly.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover font-medium mt-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          ) : (
            <>
              {serverError && (
                <Alert variant="error" onClose={() => setServerError(null)} className="mb-4">
                  {serverError}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Button
                  type="submit"
                  loading={isSubmitting}
                  className="w-full"
                >
                  <Send className="h-4 w-4" />
                  Send Reset Link
                </Button>
              </form>
            </>
          )}
        </div>

        {/* Footer link */}
        {!submitted && (
          <p className="text-center mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
