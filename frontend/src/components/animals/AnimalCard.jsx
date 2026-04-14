import { Link } from 'react-router'
import { PawPrint } from 'lucide-react'
import Card from '../ui/Card.jsx'
import StatusBadge from '../ui/StatusBadge.jsx'

function formatAge(animal) {
  const years = animal.age_years
  const months = animal.age_months
  if (years && months) return `${years}y ${months}m`
  if (years) return `${years}y`
  if (months) return `${months}m`
  return animal.age || 'Unknown age'
}

function getImageUrl(animal) {
  if (animal.primary_image?.image) return animal.primary_image.image
  if (typeof animal.primary_image === 'string') return animal.primary_image
  return null
}

export default function AnimalCard({ animal, className = '', compact = false }) {
  const imageUrl = getImageUrl(animal)
  const details = [animal.breed, formatAge(animal), animal.gender].filter(Boolean).join(' \u00B7 ')

  return (
    <Link to={`/animals/${animal.id}`} className={`group block ${className}`}>
      <Card hoverable className="p-0 overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className={`${compact ? 'aspect-video' : 'aspect-[4/3]'} bg-gradient-to-br from-orange-50 via-orange-100/50 to-amber-50 flex items-center justify-center relative overflow-hidden`}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={animal.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <PawPrint className="h-12 w-12 text-primary/20 group-hover:scale-110 transition-transform duration-500" />
          )}
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-3 right-3">
            <StatusBadge status={animal.status || 'available'} />
          </div>
        </div>

        {/* Info */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-display font-semibold text-gray-900 text-base leading-snug">
            {animal.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{details}</p>
          <div className="mt-auto pt-3">
            <span className="text-sm font-medium text-primary group-hover:text-primary-hover transition-colors inline-flex items-center gap-1 group-hover:gap-1.5">
              View Profile &rarr;
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
