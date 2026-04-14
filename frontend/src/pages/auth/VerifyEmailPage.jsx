import { useState } from 'react'
import { Link } from 'react-router'
import { MailCheck, RefreshCw, ArrowRight } from 'lucide-react'
import api from '../../api/client.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import Button from '../../components/ui/Button.jsx'
import Alert from '../../components/ui/Alert.jsx'

export default function VerifyEmailPage() {
  const { user } = useAuth()
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState(null)

  async function handleResend() {
    setResending(true)
    setResendError(null)
    setResendSuccess(false)
    try {
      await api.post('/api/v1/auth/email/resend-verification/')
      setResendSuccess(true)
    } catch (err) {
      setResendError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Failed to resend verification email. Please try again.'
      )
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
            <MailCheck className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-2xl font-bold font-display text-gray-900">
            Verify your email
          </h1>

          <p className="text-sm text-gray-500 mt-3 max-w-xs mx-auto">
            We&apos;ve sent a verification link to{' '}
            {user?.email ? (
              <span className="font-medium text-gray-700">{user.email}</span>
            ) : (
              'your email address'
            )}
            . Please check your inbox and click the link to activate your account.
          </p>

          {/* Status alerts */}
          <div className="mt-6 space-y-3">
            {resendSuccess && (
              <Alert variant="success">
                Verification email resent successfully. Check your inbox.
              </Alert>
            )}
            {resendError && (
              <Alert variant="error" onClose={() => setResendError(null)}>
                {resendError}
              </Alert>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-3">
            <Button
              variant="outline"
              onClick={handleResend}
              loading={resending}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4" />
              Resend Verification Email
            </Button>

            <Link to="/dashboard" className="block">
              <Button variant="primary" className="w-full">
                Continue to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            Didn&apos;t receive the email? Check your spam folder or try resending.
          </p>
        </div>
      </div>
    </div>
  )
}
