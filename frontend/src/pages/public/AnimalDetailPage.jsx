import { useState } from 'react'
import { useParams, Link } from 'react-router'
import {
  PawPrint,
  Heart,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Syringe,
  Baby,
  Dog,
  Palette,
  Weight,
  Calendar,
  User,
  Smile,
  ClipboardList,
} from 'lucide-react'
import useApi from '../../hooks/useApi.js'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'

function BoolTag({ label, value, icon: Icon }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
        value
          ? 'bg-success/10 text-green-700'
          : 'bg-gray-100 text-gray-400'
      }`}
    >
      {value ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <XCircle className="h-4 w-4" />
      )}
      {label}
    </span>
  )
}

function DetailItem({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-orange-50 border border-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-4.5 w-4.5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

function ImageGallery({ images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center">
        <PawPrint className="h-24 w-24 text-primary/20" />
      </div>
    )
  }

  return (
    <div>
      {/* Main image */}
      <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden relative group">
        <img
          src={images[activeIndex]?.image || images[activeIndex]}
          alt="Animal"
          className="w-full h-full object-cover"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={() => setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-colors ${
                idx === activeIndex ? 'border-primary' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={img?.image || img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Skeleton className="h-5 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Skeleton className="aspect-[4/3] w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AnimalDetailPage() {
  const { id } = useParams()
  const { data, loading, error } = useApi(`/api/v1/animals/${id}/`)

  if (loading) return <DetailSkeleton />

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <PawPrint className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link to="/animals">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Back to Animals
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const animal = data?.data ?? data ?? {}
  const images = animal.images ?? animal.photos ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <Link
          to="/animals"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Animals
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Image Gallery */}
          <ImageGallery images={images} />

          {/* Right: Info */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
                {animal.name}
              </h1>
              <Badge variant={animal.status === 'available' ? 'success' : 'warning'}>
                {animal.status || 'Available'}
              </Badge>
            </div>

            {animal.description && (
              <p className="text-gray-600 leading-relaxed mt-4">{animal.description}</p>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <DetailItem icon={Dog} label="Breed" value={animal.breed} />
              <DetailItem icon={Calendar} label="Age" value={animal.age} />
              <DetailItem icon={Weight} label="Weight" value={animal.weight ? `${animal.weight} kg` : null} />
              <DetailItem icon={User} label="Gender" value={animal.gender} />
              <DetailItem icon={Palette} label="Color" value={animal.color} />
              <DetailItem icon={Smile} label="Temperament" value={animal.temperament} />
            </div>

            {/* Boolean Tags */}
            <div className="flex flex-wrap gap-2 mt-8">
              <BoolTag label="Vaccinated" value={animal.vaccinated} icon={Syringe} />
              <BoolTag label="Spayed / Neutered" value={animal.spayed_neutered ?? animal.is_spayed} icon={CheckCircle} />
              <BoolTag label="Good with Kids" value={animal.good_with_kids} icon={Baby} />
              <BoolTag label="Good with Pets" value={animal.good_with_pets} icon={Heart} />
            </div>

            {/* CTA */}
            {animal.status === 'available' && (
              <div className="mt-10">
                <Link to={`/animals/${id}/adopt`}>
                  <Button size="lg" className="w-full sm:w-auto">
                    <Heart className="h-5 w-5" />
                    Adopt This Animal
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Medical Records Timeline */}
        {animal.medical_records && animal.medical_records.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-primary" />
              Medical Records
            </h2>
            <div className="relative border-l-2 border-gray-200 ml-4">
              {animal.medical_records.map((record, idx) => (
                <div key={idx} className="mb-8 ml-8 relative">
                  {/* Dot */}
                  <div className="absolute -left-[41px] top-1 h-4 w-4 rounded-full bg-primary border-2 border-white shadow" />
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{record.title || record.type}</h4>
                      <span className="text-xs text-gray-400">{record.date}</span>
                    </div>
                    {record.description && (
                      <p className="text-sm text-gray-500">{record.description}</p>
                    )}
                    {record.vet && (
                      <p className="text-xs text-gray-400 mt-2">Vet: {record.vet}</p>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
