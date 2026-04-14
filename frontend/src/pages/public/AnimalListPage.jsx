import { useState, useEffect, useMemo } from 'react'
import {
  Search,
  PawPrint,
  Filter,
  X,
  Syringe,
} from 'lucide-react'
import useApi from '../../hooks/useApi.js'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Select from '../../components/ui/Select.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Pagination from '../../components/ui/Pagination.jsx'
import AnimalCard from '../../components/animals/AnimalCard.jsx'
import { ANIMAL_SPECIES } from '../../lib/constants.js'

const speciesOptions = [{ value: '', label: 'All Species' }, ...ANIMAL_SPECIES]

const genderOptions = [
  { value: '', label: 'All Genders' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
]

const DEFAULT_PAGE_SIZE = 12

function AnimalCardSkeleton() {
  return (
    <Card className="p-0 overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-8 w-24" />
      </div>
    </Card>
  )
}


export default function AnimalListPage() {
  const [species, setSpecies] = useState('')
  const [gender, setGender] = useState('')
  const [search, setSearch] = useState('')
  const [vaccinated, setVaccinated] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const params = useMemo(() => {
    const p = { status: 'available', page, page_size: pageSize }
    if (species) p.species = species
    if (gender) p.gender = gender
    if (search) p.search = search
    if (vaccinated) p.is_vaccinated = true
    return p
  }, [species, gender, search, vaccinated, page, pageSize])

  const { data, loading, error, refetch } = useApi('/api/v1/animals/', { params })

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1)
  }, [species, gender, search, vaccinated])

  const animals = data?.data?.results ?? data?.results ?? []
  const totalCount = data?.data?.count ?? data?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const activeFilterCount = [species, gender, vaccinated].filter(Boolean).length

  function handlePageSizeChange(newSize) {
    setPageSize(newSize)
    setPage(1)
  }

  function clearFilters() {
    setSpecies('')
    setGender('')
    setSearch('')
    setVaccinated(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
            Available Animals
          </h1>
          <p className="mt-2 text-gray-500">
            {loading ? 'Loading...' : `${totalCount} animal${totalCount !== 1 ? 's' : ''} waiting for a home`}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-8">
          {/* Search + toggle on mobile */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or breed..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-lg text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="lg:hidden relative inline-flex items-center gap-2 h-10 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter controls - always visible on lg, toggled on mobile */}
          <div className={`mt-4 ${filtersOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <Select
                label="Species"
                id="species"
                options={speciesOptions}
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="sm:w-44"
              />
              <Select
                label="Gender"
                id="gender"
                options={genderOptions}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="sm:w-40"
              />

              {/* Toggle: Vaccinated */}
              <label className="flex items-center gap-2 cursor-pointer select-none whitespace-nowrap h-10">
                <span className="relative">
                  <input
                    type="checkbox"
                    checked={vaccinated}
                    onChange={(e) => setVaccinated(e.target.checked)}
                    className="sr-only peer"
                  />
                  <span className="block w-10 h-6 rounded-full bg-gray-200 peer-checked:bg-primary transition-colors" />
                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                </span>
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  <Syringe className="h-3.5 w-3.5" /> Vaccinated
                </span>
              </label>

              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0">
                  <X className="h-3.5 w-3.5" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-danger/10 border border-danger/20 rounded-lg text-sm text-red-700">
            Failed to load animals: {error}
            <button onClick={() => refetch()} className="ml-2 underline font-medium">
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <AnimalCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && animals.length === 0 && (
          <EmptyState
            icon={PawPrint}
            title="No animals found"
            description="Try adjusting your filters or check back later for new arrivals."
            action={
              activeFilterCount > 0 ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              ) : null
            }
          />
        )}

        {/* Animal Grid */}
        {!loading && animals.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {animals.map((animal) => (
                <AnimalCard key={animal.id} animal={animal} />
              ))}
            </div>

            {/* Pagination */}
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
          </>
        )}
      </div>
    </div>
  )
}
