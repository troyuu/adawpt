import { useState } from 'react'
import { Link } from 'react-router'
import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  CalendarDays,
  Tag,
} from 'lucide-react'
import useApi from '../../hooks/useApi.js'
import { formatShortDate, formatTime } from '../../lib/utils.js'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Pagination from '../../components/ui/Pagination.jsx'

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

function EventCardSkeleton() {
  return (
    <Card className="flex flex-col sm:flex-row gap-5">
      {/* Date block */}
      <Skeleton className="h-20 w-20 rounded-xl shrink-0" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </Card>
  )
}

export default function EventsPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, loading, error, refetch } = useApi('/api/v1/content/events/', { params: { page, page_size: pageSize } })

  const events = data?.data?.results ?? data?.results ?? data?.data ?? []
  const totalPages = data?.data?.total_pages || 1
  const totalCount = data?.data?.count || 0

  function handlePageSizeChange(newSize) {
    setPageSize(newSize)
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
            <CalendarDays className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
            Upcoming Events
          </h1>
          <p className="mt-3 text-gray-500 max-w-lg mx-auto">
            Join our community events and help make a difference for stray animals.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-danger/10 border border-danger/20 rounded-lg text-sm text-red-700 text-center">
            Failed to load events: {error}
            <button onClick={() => refetch()} className="ml-2 underline font-medium">
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && events.length === 0 && (
          <EmptyState
            icon={CalendarDays}
            title="No upcoming events"
            description="Check back soon for exciting community events, adoption drives, and fundraisers."
          />
        )}

        {/* Events List */}
        {!loading && events.length > 0 && (
          <div className="space-y-4">
            {events.map((event) => {
              const eventDate = event.start_date || event.date
              const dateObj = eventDate ? new Date(eventDate) : null

              return (
                <Link
                  key={event.id ?? event.slug}
                  to={`/events/${event.slug ?? event.id}`}
                  className="block group"
                >
                  <Card hoverable className="flex flex-col sm:flex-row gap-5">
                    {/* Date block */}
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-orange-50 flex flex-col items-center justify-center shrink-0 border border-primary/10">
                      {dateObj ? (
                        <>
                          <span className="text-[11px] font-bold text-primary/70 uppercase tracking-wide">
                            {dateObj.toLocaleDateString('en-PH', { month: 'short' })}
                          </span>
                          <span className="font-display text-2xl font-bold text-primary leading-none mt-0.5">
                            {dateObj.getDate()}
                          </span>
                        </>
                      ) : (
                        <Calendar className="h-8 w-8 text-primary/40" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <h3 className="font-display text-base font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                          {event.title}
                        </h3>
                        {event.type && (
                          <Badge variant={eventTypeBadgeVariant(event.type)} className="shrink-0">
                            <Tag className="h-3 w-3 mr-1" />
                            {event.type}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mb-2">
                        {eventDate && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatShortDate(eventDate)}
                          </span>
                        )}
                        {eventDate && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(eventDate)}
                          </span>
                        )}
                        {event.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-[200px]">{event.location}</span>
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                        {event.excerpt || event.description || ''}
                      </p>

                      <span className="mt-3 text-sm font-medium text-primary inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
                        View details <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}

        {!loading && events.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            totalCount={totalCount}
          />
        )}
      </div>
    </div>
  )
}
