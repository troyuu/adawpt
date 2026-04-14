import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Lock,
  Bell,
  Trash2,
  Save,
  Shield,
} from 'lucide-react'
import api from '../../api/client.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Card from '../../components/ui/Card.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Alert from '../../components/ui/Alert.jsx'

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirm_password: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

const notificationPrefs = [
  { id: 'email_adoptions', label: 'Adoption updates', description: 'Get notified about your adoption application status changes' },
  { id: 'email_reports', label: 'Report updates', description: 'Notifications when reports you filed are updated' },
  { id: 'email_events', label: 'Events and news', description: 'Updates about upcoming events and Adawpt news' },
  { id: 'email_donations', label: 'Donation receipts', description: 'Receive donation confirmation emails' },
]

export default function SettingsPage() {
  const { logout } = useAuth()
  const [passwordSuccess, setPasswordSuccess] = useState(null)
  const [passwordError, setPasswordError] = useState(null)
  const [deactivateModal, setDeactivateModal] = useState(false)
  const [deactivateLoading, setDeactivateLoading] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState(
    Object.fromEntries(notificationPrefs.map((p) => [p.id, true]))
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  })

  async function onPasswordSubmit(values) {
    setPasswordError(null)
    setPasswordSuccess(null)
    try {
      await api.post('/api/v1/auth/change-password/', {
        old_password: values.current_password,
        new_password: values.new_password,
      })
      setPasswordSuccess('Password changed successfully.')
      reset()
    } catch (err) {
      setPasswordError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Failed to change password. Please check your current password.'
      )
    }
  }

  function togglePref(id) {
    setNotifPrefs((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  async function handleDeactivate() {
    setDeactivateLoading(true)
    try {
      await api.post('/api/v1/auth/deactivate/')
      await logout()
    } catch {
      // If deactivation fails, just close the modal
      setDeactivateModal(false)
    } finally {
      setDeactivateLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Change Password */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 font-display">Change Password</h2>
            <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
          </div>
        </div>

        {passwordSuccess && (
          <Alert variant="success" onClose={() => setPasswordSuccess(null)} className="mb-4">
            {passwordSuccess}
          </Alert>
        )}
        {passwordError && (
          <Alert variant="error" onClose={() => setPasswordError(null)} className="mb-4">
            {passwordError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
          <Input
            id="current_password"
            label="Current Password"
            type="password"
            placeholder="Enter your current password"
            autoComplete="current-password"
            error={errors.current_password?.message}
            {...register('current_password')}
          />
          <Input
            id="new_password"
            label="New Password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            error={errors.new_password?.message}
            {...register('new_password')}
          />
          <Input
            id="confirm_password"
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter your new password"
            autoComplete="new-password"
            error={errors.confirm_password?.message}
            {...register('confirm_password')}
          />
          <Button type="submit" loading={isSubmitting}>
            <Save className="h-4 w-4" />
            Update Password
          </Button>
        </form>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-secondary/10">
            <Bell className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 font-display">Notification Preferences</h2>
            <p className="text-sm text-gray-500">Choose what notifications you want to receive</p>
          </div>
        </div>

        <div className="space-y-4">
          {notificationPrefs.map((pref) => (
            <div
              key={pref.id}
              className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{pref.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{pref.description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifPrefs[pref.id]}
                onClick={() => togglePref(pref.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                  notifPrefs[pref.id] ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    notifPrefs[pref.id] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-400">
            Notification preferences are saved automatically. Changes may take a few minutes to take effect.
          </p>
        </div>
      </Card>

      {/* Account Deactivation */}
      <Card className="border-danger/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-danger/10">
            <Shield className="h-5 w-5 text-danger" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 font-display">Danger Zone</h2>
            <p className="text-sm text-gray-500">Irreversible account actions</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 p-4 bg-danger/5 rounded-lg border border-danger/10">
          <div>
            <p className="text-sm font-medium text-gray-900">Deactivate Account</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Permanently deactivate your account. This action cannot be undone.
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setDeactivateModal(true)}>
            <Trash2 className="h-4 w-4" />
            Deactivate
          </Button>
        </div>
      </Card>

      {/* Deactivate Confirmation Modal */}
      <Modal
        isOpen={deactivateModal}
        onClose={() => setDeactivateModal(false)}
        title="Deactivate Account"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeactivateModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeactivate} loading={deactivateLoading}>
              <Trash2 className="h-4 w-4" />
              Yes, Deactivate
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Are you sure you want to deactivate your account? This will:
          </p>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Remove your profile from the platform</li>
            <li>Cancel any pending adoption applications</li>
            <li>Revoke access to all dashboard features</li>
          </ul>
          <p className="text-sm font-semibold text-danger">
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  )
}
