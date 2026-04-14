import { useState } from 'react'
import { Link } from 'react-router'
import { Heart, PawPrint } from 'lucide-react'
import useApi from '../../hooks/useApi.js'
import Card from '../../components/ui/Card.jsx'
import Alert from '../../components/ui/Alert.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Button from '../../components/ui/Button.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import Pagination from '../../components/ui/Pagination.jsx'
import AnimalCard from '../../components/animals/AnimalCard.jsx'

function AnimalCardSkeleton() {
  return (
    <Card className="p-0 overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </Card>
  )
}

export default function MyAdoptedAnimals() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, loading, error } = useApi('/api/v1/adoptions/my-adopted/', { params: { page, page_size: pageSize } })
  const animals = data?.data?.results || data?.data || []
  const totalPages = data?.data?.total_pages || 1
  const totalCount = data?.data?.count || 0

  function handlePageSizeChange(newSize) {
    setPageSize(newSize)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900">My Adopted Animals</h1>
        <p className="text-sm text-gray-500 mt-1">Your furry family members</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <AnimalCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <Alert variant="error">{error}</Alert>
      ) : animals.length === 0 ? (
        <Card>
          <EmptyState
            icon={Heart}
            title="You haven't adopted any animals yet"
            description="When you complete an adoption, your new family member will appear here."
            action={
              <Link to="/animals">
                <Button>
                  <PawPrint className="h-4 w-4" />
                  Browse Animals
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {animals.map((animal) => (
            <AnimalCard key={animal.id} animal={animal} />
          ))}
        </div>
      )}

      {!loading && animals.length > 0 && (
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
  )
}
