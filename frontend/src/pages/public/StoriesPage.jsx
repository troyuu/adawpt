import { useState } from 'react'
import { Link } from 'react-router'
import { Heart, ArrowRight, BookOpen, Calendar } from 'lucide-react'
import useApi from '../../hooks/useApi.js'
import { formatShortDate } from '../../lib/utils.js'
import Card from '../../components/ui/Card.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Button from '../../components/ui/Button.jsx'
import Pagination from '../../components/ui/Pagination.jsx'

function StorySkeleton() {
  return (
    <Card className="p-0 overflow-hidden">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-24" />
      </div>
    </Card>
  )
}

export default function StoriesPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, loading, error, refetch } = useApi('/api/v1/content/stories/', { params: { page, page_size: pageSize } })

  const stories = data?.data?.results ?? data?.results ?? data?.data ?? []
  const totalPages = data?.data?.total_pages || 1
  const totalCount = data?.data?.count || 0

  function handlePageSizeChange(newSize) {
    setPageSize(newSize)
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-secondary/10 mb-4">
            <Heart className="h-8 w-8 text-secondary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
            Success Stories
          </h1>
          <p className="mt-3 text-gray-500 max-w-lg mx-auto">
            Every adoption is a new beginning. Read heartwarming stories of rescued animals who
            found their forever homes.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-danger/10 border border-danger/20 rounded-lg text-sm text-red-700 text-center">
            Failed to load stories: {error}
            <button onClick={() => refetch()} className="ml-2 underline font-medium">
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <StorySkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && stories.length === 0 && (
          <EmptyState
            icon={BookOpen}
            title="No stories yet"
            description="Check back soon for heartwarming tales of rescued animals finding their forever homes."
          />
        )}

        {/* Story Grid */}
        {!loading && stories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Link
                key={story.id ?? story.slug}
                to={`/stories/${story.slug ?? story.id}`}
                className="group block"
              >
                <Card hoverable className="p-0 overflow-hidden h-full flex flex-col">
                  {/* Image */}
                  <div className="aspect-[16/10] bg-gradient-to-br from-teal-50 via-secondary/10 to-teal-50/50 flex items-center justify-center relative overflow-hidden">
                    {story.featured_image || story.image ? (
                      <img
                        src={story.featured_image || story.image}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <Heart className="h-12 w-12 text-secondary/20 group-hover:scale-110 transition-transform duration-500" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    {(story.published_at || story.created_at) && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                        <Calendar className="h-3 w-3" />
                        {formatShortDate(story.published_at || story.created_at)}
                      </div>
                    )}
                    <h3 className="font-display text-base font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {story.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">
                      {story.excerpt || story.summary || ''}
                    </p>
                    <span className="mt-4 text-sm font-medium text-primary inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
                      Read more <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {!loading && stories.length > 0 && (
          <div className="mt-10">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
              totalCount={totalCount}
            />
          </div>
        )}
      </div>
    </div>
  )
}
