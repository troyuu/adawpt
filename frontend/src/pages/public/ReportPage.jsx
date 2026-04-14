import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import {
  MapPin,
  Info,
  Camera,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  AlertTriangle,
  AlertCircle,
  Flame,
} from 'lucide-react'
import api from '../../api/client.js'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Textarea from '../../components/ui/Textarea.jsx'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import LocationPicker from '../../components/reports/LocationPicker.jsx'
import { ANIMAL_SPECIES } from '../../lib/constants.js'

const STEPS = [
  { key: 'location', label: 'Location', icon: MapPin },
  { key: 'details', label: 'Details', icon: Info },
  { key: 'photos', label: 'Photos', icon: Camera },
  { key: 'review', label: 'Review', icon: ClipboardCheck },
]

const animalTypeOptions = ANIMAL_SPECIES

const urgencyLevels = [
  {
    value: 'low',
    label: 'Low',
    description: 'Animal appears healthy but is a stray',
    color: 'text-green-600 bg-green-50 border-green-200',
    icon: Info,
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Animal appears injured or distressed',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    icon: AlertTriangle,
  },
  {
    value: 'high',
    label: 'High',
    description: 'Animal needs immediate medical attention',
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    icon: AlertCircle,
  },
  {
    value: 'critical',
    label: 'Critical',
    description: 'Life-threatening situation, urgent rescue needed',
    color: 'text-red-600 bg-red-50 border-red-200',
    icon: Flame,
  },
]

const MAX_PHOTOS = 5

function StepIndicator({ steps, currentStep }) {
  return (
    <nav className="flex items-center justify-center gap-2 sm:gap-4" aria-label="Report progress">
      {steps.map((step, idx) => {
        const isActive = idx === currentStep
        const isComplete = idx < currentStep
        return (
          <div key={step.key} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : isComplete
                    ? 'bg-primary/20 text-primary'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isComplete ? (
                  <ClipboardCheck className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  isActive ? 'text-primary' : isComplete ? 'text-gray-600' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`w-8 sm:w-12 h-0.5 rounded mb-5 sm:mb-4 ${
                  isComplete ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}

export default function ReportPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // Step 1: Location
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)

  // Step 2: Details
  const [animalType, setAnimalType] = useState('')
  const [description, setDescription] = useState('')
  const [urgency, setUrgency] = useState('')

  // Step 3: Photos
  const [photos, setPhotos] = useState([]) // { file, preview }[]

  // Step 4: Contact (optional)
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')

  function validateStep(step) {
    const newErrors = {}
    if (step === 0) {
      if (!address.trim()) newErrors.address = 'Location is required'
    }
    if (step === 1) {
      if (!animalType) newErrors.animalType = 'Please select an animal type'
      if (!description.trim()) newErrors.description = 'Please describe the animal'
      if (!urgency) newErrors.urgency = 'Please select an urgency level'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function goNext() {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1))
    }
  }

  function goBack() {
    setErrors({})
    setCurrentStep((s) => Math.max(s - 1, 0))
  }

  const handlePhotoAdd = useCallback(
    (e) => {
      const files = Array.from(e.target.files || [])
      const remaining = MAX_PHOTOS - photos.length
      const toAdd = files.slice(0, remaining).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }))
      setPhotos((prev) => [...prev, ...toAdd])
      e.target.value = ''
    },
    [photos.length]
  )

  function removePhoto(idx) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('address', address)
      formData.append('animal_type', animalType)
      formData.append('description', description)
      formData.append('urgency', urgency)
      if (latitude !== null) formData.append('latitude', latitude)
      if (longitude !== null) formData.append('longitude', longitude)
      if (contactName) formData.append('contact_name', contactName)
      if (contactPhone) formData.append('contact_phone', contactPhone)
      if (contactEmail) formData.append('contact_email', contactEmail)
      photos.forEach((p) => formData.append('photos', p.file))

      const response = await api.post('/api/v1/reports/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const trackingId =
        response.data?.data?.tracking_id ?? response.data?.tracking_id ?? 'ADWPT-XXXX'
      navigate('/report/confirmation', { state: { trackingId } })
    } catch (err) {
      setErrors({
        submit: err.response?.data?.message || err.message || 'Failed to submit report',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
            Report a Stray
          </h1>
          <p className="mt-2 text-gray-500">
            Help us rescue animals in need. Fill in the details below.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-10">
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          {/* ----- Step 1: Location ----- */}
          {currentStep === 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-gray-900 mb-1">
                Where did you see the animal?
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Provide the most specific address or landmark you can.
              </p>

              <LocationPicker
                value={{ lat: latitude, lng: longitude, address }}
                onChange={({ lat, lng, address: addr }) => {
                  setLatitude(lat)
                  setLongitude(lng)
                  setAddress(addr)
                }}
                error={errors.address}
              />
            </div>
          )}

          {/* ----- Step 2: Details ----- */}
          {currentStep === 1 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-gray-900 mb-1">
                Tell us about the animal
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                The more detail you give, the faster we can respond.
              </p>

              <div className="space-y-5">
                <Select
                  id="animalType"
                  label="Animal Type"
                  placeholder="Select type..."
                  options={animalTypeOptions}
                  value={animalType}
                  onChange={(e) => setAnimalType(e.target.value)}
                  error={errors.animalType}
                />

                <Textarea
                  id="description"
                  label="Description"
                  placeholder="Describe the animal's appearance, behavior, and condition..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  error={errors.description}
                />

                {/* Urgency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency Level
                  </label>
                  {errors.urgency && (
                    <p className="text-xs text-danger mb-2">{errors.urgency}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {urgencyLevels.map((level) => (
                      <label
                        key={level.value}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          urgency === level.value
                            ? level.color + ' border-current'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="urgency"
                          value={level.value}
                          checked={urgency === level.value}
                          onChange={(e) => setUrgency(e.target.value)}
                          className="sr-only"
                        />
                        <level.icon className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">{level.label}</p>
                          <p className="text-xs opacity-75 mt-0.5">{level.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----- Step 3: Photos ----- */}
          {currentStep === 2 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-gray-900 mb-1">
                Add Photos
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Upload up to {MAX_PHOTOS} photos to help us identify and locate the animal.
              </p>

              {/* Upload area */}
              {photos.length < MAX_PHOTOS && (
                <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer mb-4">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-600">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 10MB ({MAX_PHOTOS - photos.length} remaining)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoAdd}
                    className="sr-only"
                  />
                </label>
              )}

              {/* Preview thumbnails */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={photo.preview}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Remove photo ${idx + 1}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {photos.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-4">
                  No photos added yet. Photos are optional but highly recommended.
                </p>
              )}
            </div>
          )}

          {/* ----- Step 4: Review ----- */}
          {currentStep === 3 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-gray-900 mb-1">
                Review Your Report
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Please verify the information below before submitting.
              </p>

              {/* Summary */}
              <div className="space-y-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Location</p>
                  <p className="text-sm font-medium text-gray-900">{address || 'Not provided'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Animal Type</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{animalType || 'Not selected'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Urgency</p>
                    <Badge
                      variant={
                        urgency === 'critical' || urgency === 'high'
                          ? 'danger'
                          : urgency === 'medium'
                          ? 'warning'
                          : 'success'
                      }
                    >
                      {urgency || 'Not selected'}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{description || 'Not provided'}</p>
                </div>

                {photos.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      Photos ({photos.length})
                    </p>
                    <div className="flex gap-2 overflow-x-auto">
                      {photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo.preview}
                          alt={`Preview ${idx + 1}`}
                          className="h-16 w-16 rounded-lg object-cover shrink-0 border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Contact Info */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-display text-lg font-semibold text-gray-900 mb-1">
                  Contact Information
                  <span className="text-sm font-normal text-gray-400 ml-2">(optional)</span>
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Leave your contact details if you want us to follow up with you.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="contactName"
                    label="Name"
                    placeholder="Your name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                  <Input
                    id="contactPhone"
                    label="Phone"
                    type="tel"
                    placeholder="+63 9XX XXX XXXX"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                  <Input
                    id="contactEmail"
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="sm:col-span-2"
                  />
                </div>
              </div>

              {errors.submit && (
                <div className="mt-6 p-4 bg-danger/10 border border-danger/20 rounded-lg text-sm text-red-700">
                  {errors.submit}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {currentStep > 0 ? (
            <Button variant="outline" onClick={goBack} disabled={submitting}>
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={goNext}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={submitting}>
              Submit Report
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
