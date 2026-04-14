import { useParams, Link } from 'react-router'
import { ArrowLeft, Heart, PawPrint, Calendar } from 'lucide-react'
import useApi from '../../hooks/useApi.js'
import { formatLongDate } from '../../lib/utils.js'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Skeleton className="h-5 w-32 mb-8" />
        <Skeleton className="aspect-[16/9] w-full rounded-xl mb-8" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-5 w-48 mb-8" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  )
}

export default function StoryDetailPage() {
  const { slug } = useParams()
  const { data, loading, error } = useApi(`/api/v1/content/stories/${slug}/`)

  if (loading) return <DetailSkeleton />

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Story not found</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link to="/stories">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Back to Stories
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const story = data?.data ?? data ?? {}
  const animal = story.animal ?? null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back link */}
        <Link
          to="/stories"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Stories
        </Link>

        {/* Featured Image */}
        <div className="aspect-[16/9] bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl overflow-hidden mb-8">
          {story.featured_image || story.image ? (
            <img
              src={story.featured_image || story.image}
              alt={story.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Heart className="h-20 w-20 text-secondary/20" />
            </div>
          )}
        </div>

        {/* Title & Meta */}
        <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          {story.title}
        </h1>

        {(story.published_at || story.created_at) && (
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Calendar className="h-4 w-4" />
            {formatLongDate(story.published_at || story.created_at)}
          </div>
        )}

        {/* Body */}
        <article className="mb-12">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
            {story.body || story.content || story.text || 'Full story content will appear here.'}
          </p>
        </article>

        {/* Linked Animal */}
        {animal && (
          <Card className="mb-8">
            <h3 className="font-display text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PawPrint className="h-5 w-5 text-primary" />
              Featured Animal
            </h3>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center shrink-0 overflow-hidden">
                {animal.primary_image ? (
                  <img
                    src={animal.primary_image}
                    alt={animal.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <PawPrint className="h-8 w-8 text-primary/30" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-gray-900">{animal.name}</p>
                <p className="text-sm text-gray-500">
                  {[animal.breed, animal.age, animal.gender].filter(Boolean).join(' \u00B7 ')}
                </p>
                {animal.status && (
                  <Badge variant={animal.status === 'adopted' ? 'success' : 'primary'} className="mt-1">
                    {animal.status}
                  </Badge>
                )}
              </div>
              <Link to={`/animals/${animal.id}`}>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Back link */}
        <div className="text-center">
          <Link to="/stories">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Back to Stories
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
