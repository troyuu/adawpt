import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Save, Camera } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import api from '../../api/client.js'
import { useToast } from '../../components/ui/Toast.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Card from '../../components/ui/Card.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import Alert from '../../components/ui/Alert.jsx'
import Spinner from '../../components/ui/Spinner.jsx'

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50),
  last_name: z.string().min(1, 'Last name is required').max(50),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[+]?[\d\s()-]{7,20}$/.test(val),
      'Invalid phone number'
    ),
  address: z.string().optional(),
})

export default function ProfilePage() {
  const { user, fetchUser } = useAuth()
  const { addToast } = useToast()
  const [successMessage, setSuccessMessage] = useState(null)
  const [serverError, setServerError] = useState(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone: '',
      address: '',
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        address: user.address || '',
      })
    }
  }, [user, reset])

  async function onSubmit(values) {
    setServerError(null)
    setSuccessMessage(null)
    try {
      await api.patch('/api/v1/auth/me/', values)
      await fetchUser()
      setSuccessMessage('Profile updated successfully.')
      addToast({ message: 'Profile updated successfully.', type: 'success' })
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || 'Failed to update profile.'
      setServerError(errorMsg)
      addToast({ message: errorMsg, type: 'error' })
    }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarUploading(true)
    setServerError(null)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      await api.patch('/api/v1/auth/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await fetchUser()
    } catch (err) {
      setServerError(
        err.response?.data?.message || err.response?.data?.detail || 'Failed to upload avatar.'
      )
    } finally {
      setAvatarUploading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your personal information</p>
      </div>

      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}
      {serverError && (
        <Alert variant="error" onClose={() => setServerError(null)}>
          {serverError}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar section */}
        <Card className="flex flex-col items-center text-center lg:col-span-1">
          <div className="relative group">
            <Avatar
              src={user.avatar}
              name={`${user.first_name} ${user.last_name}`}
              size="xl"
              className="h-24 w-24 text-2xl"
            />
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {avatarUploading ? (
                <Spinner size="sm" className="text-white" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={avatarUploading}
              />
            </label>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900 font-display">
            {user.first_name} {user.last_name}
          </h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          <span className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
            {user.role}
          </span>
        </Card>

        {/* Profile form */}
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 font-display mb-6">
            Personal Information
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="first_name"
                label="First Name"
                placeholder="John"
                error={errors.first_name?.message}
                {...register('first_name')}
              />
              <Input
                id="last_name"
                label="Last Name"
                placeholder="Doe"
                error={errors.last_name?.message}
                {...register('last_name')}
              />
            </div>

            <Input
              id="email"
              label="Email"
              type="email"
              value={user.email}
              disabled
              className="opacity-60"
            />

            <Input
              id="phone"
              label="Phone Number"
              type="tel"
              placeholder="+63 9XX XXX XXXX"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                id="address"
                rows={3}
                placeholder="Your address..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors resize-y"
                {...register('address')}
              />
              {errors.address && (
                <p className="mt-1 text-xs text-danger">{errors.address.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
