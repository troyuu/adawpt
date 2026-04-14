import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import {
  Home,
  Users,
  Heart,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PawPrint,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import useApi from '../../hooks/useApi.js'
import { createApplication } from '../../api/endpoints/adoptions.js'
import Button from '../../components/ui/Button.jsx'
import Select from '../../components/ui/Select.jsx'
import Textarea from '../../components/ui/Textarea.jsx'
import Card from '../../components/ui/Card.jsx'
import Alert from '../../components/ui/Alert.jsx'

const STEPS = [
  { key: 'housing', label: 'Housing', icon: Home },
  { key: 'household', label: 'Household', icon: Users },
  { key: 'references', label: 'References', icon: Heart },
  { key: 'review', label: 'Review', icon: ClipboardCheck },
]

const housingTypeOptions = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condo' },
  { value: 'other', label: 'Other' },
]

function StepIndicator({ steps, currentStep }) {
  return (
    <nav className="flex items-center justify-center gap-2 sm:gap-4" aria-label="Adoption form progress">
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

export default function AdoptionFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const { data: animalData, loading: animalLoading } = useApi(`/api/v1/animals/${id}/`)
  const animal = animalData?.data

  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // Step 1: Housing
  const [housingType, setHousingType] = useState('')
  const [ownsOrRents, setOwnsOrRents] = useState('')
  const [landlordPermission, setLandlordPermission] = useState(false)
  const [hasYard, setHasYard] = useState('')

  // Step 2: Household & Experience
  const [otherPets, setOtherPets] = useState('')
  const [childrenInfo, setChildrenInfo] = useState('')
  const [petExperience, setPetExperience] = useState('')
  const [workSchedule, setWorkSchedule] = useState('')

  // Step 3: References & Commitment
  const [vetReference, setVetReference] = useState('')
  const [personalReferences, setPersonalReferences] = useState('')
  const [reasonToAdopt, setReasonToAdopt] = useState('')
  const [agreesToHomeVisit, setAgreesToHomeVisit] = useState(false)

  // Auth gate: redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/login?next=/animals/${id}/adopt`, { replace: true })
    }
  }, [authLoading, user, navigate, id])

  // Show spinner while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  // Not logged in — will redirect via useEffect
  if (!user) return null

  function validateStep(step) {
    const newErrors = {}
    if (step === 0) {
      if (!housingType) newErrors.housingType = 'Please select a housing type'
      if (!ownsOrRents) newErrors.ownsOrRents = 'Please select whether you own or rent'
      if (!hasYard) newErrors.hasYard = 'Please indicate if you have a yard'
      if (ownsOrRents === 'rents' && !landlordPermission)
        newErrors.landlordPermission = 'Landlord permission is required for renters'
    }
    if (step === 1) {
      if (!petExperience.trim()) newErrors.petExperience = 'Please describe your pet experience'
      if (!workSchedule.trim()) newErrors.workSchedule = 'Please describe your work schedule'
    }
    if (step === 2) {
      if (!personalReferences.trim())
        newErrors.personalReferences = 'Please provide at least one personal reference'
      if (!reasonToAdopt.trim()) newErrors.reasonToAdopt = 'Please share your reason to adopt'
      if (!agreesToHomeVisit)
        newErrors.agreesToHomeVisit = 'You must agree to a home visit'
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

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await createApplication({
        animal: id,
        housing_type: housingType,
        owns_or_rents: ownsOrRents,
        landlord_permission: ownsOrRents === 'rents' ? landlordPermission : null,
        has_yard: hasYard === 'yes',
        other_pets: otherPets || '',
        children_info: childrenInfo || '',
        pet_experience: petExperience,
        work_schedule: workSchedule,
        vet_reference: vetReference || '',
        personal_references: personalReferences,
        reason_to_adopt: reasonToAdopt,
        agrees_to_home_visit: agreesToHomeVisit,
      })
      navigate('/dashboard/applications', {
        state: { success: 'Your adoption application has been submitted!' },
      })
    } catch (err) {
      setErrors({
        submit:
          err.response?.data?.message ||
          err.response?.data?.detail ||
          err.message ||
          'Failed to submit application',
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
            Adoption Application
          </h1>
          {animalLoading ? (
            <p className="mt-2 text-gray-500">Loading animal info...</p>
          ) : animal ? (
            <div className="mt-3 inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full px-5 py-2">
              {animal.primary_image ? (
                <img
                  src={animal.primary_image}
                  alt={animal.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <PawPrint className="h-5 w-5 text-gray-400" />
              )}
              <span className="text-sm font-medium text-gray-700">
                Applying to adopt <strong>{animal.name}</strong>
              </span>
            </div>
          ) : (
            <p className="mt-2 text-gray-500">
              Complete the form below to apply for adoption.
            </p>
          )}
        </div>

        {/* Step Indicator */}
        <div className="mb-10">
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          {/* ----- Step 1: Housing ----- */}
          {currentStep === 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-gray-900 mb-1">
                Housing Information
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Tell us about your living situation.
              </p>

              <div className="space-y-5">
                <Select
                  id="housingType"
                  label="Housing Type"
                  placeholder="Select type..."
                  options={housingTypeOptions}
                  value={housingType}
                  onChange={(e) => setHousingType(e.target.value)}
                  error={errors.housingType}
                />

                {/* Owns or Rents */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you own or rent?
                  </label>
                  {errors.ownsOrRents && (
                    <p className="text-xs text-danger mb-2">{errors.ownsOrRents}</p>
                  )}
                  <div className="flex gap-3">
                    {[
                      { value: 'owns', label: 'Own' },
                      { value: 'rents', label: 'Rent' },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          ownsOrRents === opt.value
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="ownsOrRents"
                          value={opt.value}
                          checked={ownsOrRents === opt.value}
                          onChange={(e) => setOwnsOrRents(e.target.value)}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Landlord Permission (only if renting) */}
                {ownsOrRents === 'rents' && (
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={landlordPermission}
                        onChange={(e) => setLandlordPermission(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          I have landlord permission to keep pets
                        </span>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Required for renters. We may ask for documentation.
                        </p>
                      </div>
                    </label>
                    {errors.landlordPermission && (
                      <p className="text-xs text-danger mt-1">{errors.landlordPermission}</p>
                    )}
                  </div>
                )}

                {/* Has Yard */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you have a yard?
                  </label>
                  {errors.hasYard && (
                    <p className="text-xs text-danger mb-2">{errors.hasYard}</p>
                  )}
                  <div className="flex gap-3">
                    {[
                      { value: 'yes', label: 'Yes' },
                      { value: 'no', label: 'No' },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          hasYard === opt.value
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="hasYard"
                          value={opt.value}
                          checked={hasYard === opt.value}
                          onChange={(e) => setHasYard(e.target.value)}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----- Step 2: Household & Experience ----- */}
          {currentStep === 1 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-gray-900 mb-1">
                Household & Experience
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Help us understand your home and experience with animals.
              </p>

              <div className="space-y-5">
                <Textarea
                  id="otherPets"
                  label="Other Pets (optional)"
                  placeholder="List any pets you currently have, including type, breed, and age..."
                  rows={3}
                  value={otherPets}
                  onChange={(e) => setOtherPets(e.target.value)}
                />

                <Textarea
                  id="childrenInfo"
                  label="Children in Household (optional)"
                  placeholder="List ages of children in your household, if any..."
                  rows={2}
                  value={childrenInfo}
                  onChange={(e) => setChildrenInfo(e.target.value)}
                />

                <Textarea
                  id="petExperience"
                  label="Pet Experience"
                  placeholder="Describe your experience caring for pets..."
                  rows={3}
                  value={petExperience}
                  onChange={(e) => setPetExperience(e.target.value)}
                  error={errors.petExperience}
                />

                <Textarea
                  id="workSchedule"
                  label="Work Schedule"
                  placeholder="Describe your typical work schedule and how much time you can spend with your pet..."
                  rows={3}
                  value={workSchedule}
                  onChange={(e) => setWorkSchedule(e.target.value)}
                  error={errors.workSchedule}
                />
              </div>
            </div>
          )}

          {/* ----- Step 3: References & Commitment ----- */}
          {currentStep === 2 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-gray-900 mb-1">
                References & Commitment
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Provide references and share why you want to adopt.
              </p>

              <div className="space-y-5">
                <Textarea
                  id="vetReference"
                  label="Veterinarian Reference (optional)"
                  placeholder="Name, clinic, and contact info of your vet..."
                  rows={2}
                  value={vetReference}
                  onChange={(e) => setVetReference(e.target.value)}
                />

                <Textarea
                  id="personalReferences"
                  label="Personal References"
                  placeholder="Provide name, relationship, and contact info for at least one reference..."
                  rows={3}
                  value={personalReferences}
                  onChange={(e) => setPersonalReferences(e.target.value)}
                  error={errors.personalReferences}
                />

                <Textarea
                  id="reasonToAdopt"
                  label="Why do you want to adopt?"
                  placeholder="Tell us why you want to adopt this animal and what kind of home you'll provide..."
                  rows={4}
                  value={reasonToAdopt}
                  onChange={(e) => setReasonToAdopt(e.target.value)}
                  error={errors.reasonToAdopt}
                />

                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreesToHomeVisit}
                      onChange={(e) => setAgreesToHomeVisit(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        I agree to a home visit
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        A shelter representative may visit your home before approval.
                      </p>
                    </div>
                  </label>
                  {errors.agreesToHomeVisit && (
                    <p className="text-xs text-danger mt-1">{errors.agreesToHomeVisit}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ----- Step 4: Review ----- */}
          {currentStep === 3 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-gray-900 mb-1">
                Review Your Application
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Please verify the information below before submitting.
              </p>

              <div className="space-y-4 mb-6">
                {/* Housing */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Housing</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>{' '}
                      <span className="font-medium text-gray-900 capitalize">{housingType}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Ownership:</span>{' '}
                      <span className="font-medium text-gray-900 capitalize">
                        {ownsOrRents === 'owns' ? 'Own' : 'Rent'}
                      </span>
                    </div>
                    {ownsOrRents === 'rents' && (
                      <div>
                        <span className="text-gray-500">Landlord permission:</span>{' '}
                        <span className="font-medium text-gray-900">
                          {landlordPermission ? 'Yes' : 'No'}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Has yard:</span>{' '}
                      <span className="font-medium text-gray-900 capitalize">{hasYard}</span>
                    </div>
                  </div>
                </div>

                {/* Household & Experience */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                    Household & Experience
                  </p>
                  <div className="space-y-2 text-sm">
                    {otherPets && (
                      <div>
                        <span className="text-gray-500">Other pets:</span>{' '}
                        <span className="text-gray-700">{otherPets}</span>
                      </div>
                    )}
                    {childrenInfo && (
                      <div>
                        <span className="text-gray-500">Children:</span>{' '}
                        <span className="text-gray-700">{childrenInfo}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Pet experience:</span>{' '}
                      <span className="text-gray-700">{petExperience}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Work schedule:</span>{' '}
                      <span className="text-gray-700">{workSchedule}</span>
                    </div>
                  </div>
                </div>

                {/* References & Commitment */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                    References & Commitment
                  </p>
                  <div className="space-y-2 text-sm">
                    {vetReference && (
                      <div>
                        <span className="text-gray-500">Vet reference:</span>{' '}
                        <span className="text-gray-700">{vetReference}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Personal references:</span>{' '}
                      <span className="text-gray-700">{personalReferences}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Reason to adopt:</span>{' '}
                      <span className="text-gray-700">{reasonToAdopt}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Agrees to home visit:</span>{' '}
                      <span className="font-medium text-gray-900">
                        {agreesToHomeVisit ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {errors.submit && (
                <Alert variant="error" title="Submission Failed">
                  {errors.submit}
                </Alert>
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
            <Link to={`/animals/${id}`}>
              <Button variant="outline">
                <ChevronLeft className="h-4 w-4" />
                Back to Animal
              </Button>
            </Link>
          )}

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={goNext}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={submitting}>
              Submit Application
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
