import { useParams, Link } from 'react-router'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Tag,
  CalendarDays,
} from 'lucide-react'
import useApi from '../../hooks/useApi.js'
import { formatLongDate, formatTime } from '../../lib/utils.js'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'

function eventTypeBadgeVariant(type) {
  switch (type?.toLowerCase()) {
    case 'adoption':
      return 'success'
    case 'fundraiser':
      return 'primary'
    case 'volunteer':
      return 'info'
    case 'workshop':
      return 'warning'
    default:
      return 'default'
  }
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Skeleton className="h-5 w-32 mb-8" />
        <Skeleton className="aspect-[16/9] w-full rounded-xl mb-8" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  )
}

export default function EventDetailPage() {
  const { slug } = useParams()
  const { data, loading, error } = useApi(`/api/v1/content/events/${slug}/`)

  if (loading) return <DetailSkeleton />

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <CalendarDays className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Event not found</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link to="/events">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const event = data?.data ?? data ?? {}
  const eventDate = event.start_date || event.date
  const endDate = event.end_date

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back link */}
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>

        {/* Featured Image */}
        <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl overflow-hidden mb-8">
          {event.featured_image || event.image ? (
            <img
              src={event.featured_image || event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CalendarDays className="h-20 w-20 text-primary/20" />
            </div>
          )}
        </div>

        {/* Title & Type Badge */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
            {event.title}
          </h1>
          {event.type && (
            <Badge variant={eventTypeBadgeVariant(event.type)} className="shrink-0 mt-1">
              <Tag className="h-3 w-3 mr-1" />
              {event.type}
            </Badge>
          )}
        </div>

        {/* Meta details */}
        <Card className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            {eventDate && (
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-orange-50 border border-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Date</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {formatLongDate(eventDate)}
                    {endDate && endDate !== eventDate && (
                      <> &ndash; {formatLongDate(endDate)}</>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Time */}
            {eventDate && (
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-orange-50 border border-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Time</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {formatTime(eventDate)}
                    {endDate && <> &ndash; {formatTime(endDate)}</>}
                  </p>
                </div>
              </div>
            )}

            {/* Location */}
            {event.location && (
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-orange-50 border border-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Location</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{event.location}</p>
                </div>
              </div>
            )}

            {/* Type */}
            {event.type && (
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-orange-50 border border-primary/10 flex items-center justify-center shrink-0">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Event Type</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5 capitalize">{event.type}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Description */}
        <article className="mb-12">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
            {event.body || event.full_description || event.description || 'Full event details will appear here.'}
          </p>
        </article>

        {/* Back link */}
        <div className="text-center">
          <Link to="/events">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
