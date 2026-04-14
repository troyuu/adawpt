import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  PawPrint,
  X,
  ImageIcon,
  Loader2,
} from 'lucide-react'
import useApi from '../../hooks/useApi.js'
import { formatShortDate } from '../../lib/utils.js'
import api from '../../api/client.js'
import { uploadAnimalImage, deleteAnimalImage, getAnimalImages } from '../../api/endpoints/animals.js'
import { useToast } from '../../components/ui/Toast.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Card from '../../components/ui/Card.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Pagination from '../../components/ui/Pagination.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import Alert from '../../components/ui/Alert.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import FileUpload from '../../components/ui/FileUpload.jsx'
import { ANIMAL_SPECIES, ANIMAL_STATUSES } from '../../lib/constants.js'

const statusOptions = [{ value: '', label: 'All Statuses' }, ...ANIMAL_STATUSES]


const animalSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  species: z.string().min(1, 'Species is required'),
  breed: z.string().optional(),
  age_years: z.coerce.number().min(0).optional().or(z.literal('')),
  age_months: z.coerce.number().min(0).max(11).optional().or(z.literal('')),
  gender: z.string().min(1, 'Gender is required'),
  status: z.string().min(1, 'Status is required'),
  intake_date: z.string().min(1, 'Intake date is required'),
  description: z.string().optional(),
  is_vaccinated: z.boolean().optional(),
})

const speciesOptions = ANIMAL_SPECIES

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'unknown', label: 'Unknown' },
]

const formStatusOptions = ANIMAL_STATUSES

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  )
}

export default function AnimalsManagement() {
  const { addToast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [editAnimal, setEditAnimal] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [pendingFiles, setPendingFiles] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [uploadProgress, setUploadProgress] = useState(null)
  const [uploadError, setUploadError] = useState(null)

  const params = { page, page_size: pageSize, search: search || undefined, status: statusFilter || undefined }
  const { data, loading, error, refetch } = useApi('/api/v1/animals/', { params })

  const animals = data?.data?.results || []
  const totalPages = data?.data?.total_pages || 1
  const totalCount = data?.data?.count || 0

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(animalSchema),
  })

  const openAddModal = useCallback(() => {
    setEditAnimal(null)
    setPendingFiles([])
    setExistingImages([])
    setUploadError(null)
    setUploadProgress(null)
    reset({ name: '', species: '', breed: '', age_years: '', age_months: '', gender: '', status: 'intake', intake_date: new Date().toISOString().slice(0, 10), description: '', is_vaccinated: false })
    setModalOpen(true)
  }, [reset])

  const openEditModal = useCallback(
    async (animal) => {
      setEditAnimal(animal)
      setPendingFiles([])
      setUploadError(null)
      setUploadProgress(null)
      reset({
        name: animal.name,
        species: animal.species,
        breed: animal.breed || '',
        age_years: animal.age_years ?? '',
        age_months: animal.age_months ?? '',
        gender: animal.gender || '',
        status: animal.status,
        intake_date: animal.intake_date || '',
        description: animal.description || '',
        is_vaccinated: animal.is_vaccinated ?? false,
      })
      setModalOpen(true)
      try {
        const res = await getAnimalImages(animal.id)
        setExistingImages(res.data?.results || res.data || [])
      } catch {
        setExistingImages([])
      }
    },
    [reset]
  )

  async function onSubmit(values) {
    setActionError(null)
    setUploadError(null)
    // Clean up empty optional number fields
    const payload = { ...values }
    if (payload.age_years === '' || payload.age_years === undefined) payload.age_years = null
    if (payload.age_months === '' || payload.age_months === undefined) payload.age_months = null
    try {
      let animalId
      if (editAnimal) {
        await api.patch(`/api/v1/animals/${editAnimal.id}/`, payload)
        animalId = editAnimal.id
      } else {
        const res = await api.post('/api/v1/animals/', payload)
        animalId = res.data?.data?.id
      }

      // Upload pending images
      if (pendingFiles.length > 0 && animalId) {
        setUploadProgress({ current: 0, total: pendingFiles.length })
        const uploadErrors = []
        for (let i = 0; i < pendingFiles.length; i++) {
          setUploadProgress({ current: i + 1, total: pendingFiles.length })
          const formData = new FormData()
          formData.append('image', pendingFiles[i])
          // First image is primary if no existing images
          if (i === 0 && existingImages.length === 0) {
            formData.append('is_primary', 'true')
          }
          try {
            await uploadAnimalImage(animalId, formData)
          } catch (err) {
            uploadErrors.push(pendingFiles[i].name)
          }
        }
        setUploadProgress(null)
        if (uploadErrors.length > 0) {
          setUploadError(`Failed to upload: ${uploadErrors.join(', ')}`)
          setPendingFiles([])
          refetch()
          return // Keep modal open so user can see the error
        }
      }

      setModalOpen(false)
      refetch()
      addToast({ message: editAnimal ? 'Animal updated successfully.' : 'Animal created successfully.', type: 'success' })
    } catch (err) {
      const data = err.response?.data
      let errorMsg
      if (data?.errors && typeof data.errors === 'object') {
        errorMsg = Object.entries(data.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('. ')
      } else {
        errorMsg = data?.message || data?.detail || 'Failed to save animal.'
      }
      setActionError(errorMsg)
      addToast({ message: errorMsg, type: 'error' })
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return
    setActionLoading(true)
    setActionError(null)
    try {
      await api.delete(`/api/v1/animals/${deleteConfirm.id}/`)
      setDeleteConfirm(null)
      refetch()
      addToast({ message: 'Animal deleted successfully.', type: 'success' })
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || 'Failed to delete animal.'
      setActionError(errorMsg)
      addToast({ message: errorMsg, type: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  function handlePageSizeChange(newSize) {
    setPageSize(newSize)
    setPage(1)
  }

  function handleSearch(e) {
    setSearch(e.target.value)
    setPage(1)
  }

  function handleStatusFilter(e) {
    setStatusFilter(e.target.value)
    setPage(1)
  }

  async function handleRemoveExistingImage(imageId) {
    if (!editAnimal) return
    try {
      await deleteAnimalImage(editAnimal.id, imageId)
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId))
    } catch {
      setUploadError('Failed to remove image.')
    }
  }

  function handleFilesSelected(files) {
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    const valid = files.filter((f) => f.size <= MAX_SIZE)
    if (valid.length < files.length) {
      setUploadError('Some files exceeded 5MB and were excluded.')
    }
    setPendingFiles(valid)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Animals</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all animals in the system</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4" />
          Add Animal
        </Button>
      </div>

      {/* Filters */}
      <Card className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or breed..."
            value={search}
            onChange={handleSearch}
            className="w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        </div>
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={handleStatusFilter}
          className="sm:w-48"
        />
      </Card>

      {actionError && (
        <Alert variant="error" onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      {/* Table */}
      <Card className="overflow-x-auto">
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <Alert variant="error">{error}</Alert>
        ) : animals.length === 0 ? (
          <EmptyState
            icon={PawPrint}
            title="No animals found"
            description={search || statusFilter ? 'Try adjusting your filters.' : 'Add your first animal to get started.'}
            action={
              !search && !statusFilter ? (
                <Button onClick={openAddModal}>
                  <Plus className="h-4 w-4" />
                  Add Animal
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <table className="w-full text-sm text-left hidden md:table">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-500 w-12"></th>
                  <th className="pb-3 font-medium text-gray-500">Name</th>
                  <th className="pb-3 font-medium text-gray-500">Species</th>
                  <th className="pb-3 font-medium text-gray-500">Breed</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500">Intake Date</th>
                  <th className="pb-3 font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {animals.map((animal) => (
                  <tr key={animal.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3">
                      {animal.primary_image ? (
                        <img
                          src={animal.primary_image.image}
                          alt={animal.name}
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 font-medium text-gray-900">{animal.name}</td>
                    <td className="py-3 text-gray-600 capitalize">{animal.species}</td>
                    <td className="py-3 text-gray-600">{animal.breed || '--'}</td>
                    <td className="py-3">
                      <StatusBadge status={animal.status} />
                    </td>
                    <td className="py-3 text-gray-600">
                      {formatShortDate(animal.intake_date)}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(animal)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          aria-label={`Edit ${animal.name}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(animal)}
                          className="p-2 text-gray-400 hover:text-danger hover:bg-danger/5 rounded-lg transition-colors"
                          aria-label={`Delete ${animal.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {animals.map((animal) => (
                <div key={animal.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3 min-w-0">
                    {animal.primary_image ? (
                      <img
                        src={animal.primary_image.image}
                        alt={animal.name}
                        className="h-10 w-10 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <ImageIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{animal.name}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {animal.species}{animal.breed ? ` · ${animal.breed}` : ''}
                      </p>
                      <div className="mt-1.5">
                        <StatusBadge status={animal.status} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(animal)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                      aria-label={`Edit ${animal.name}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(animal)}
                      className="p-2 text-gray-400 hover:text-danger hover:bg-danger/5 rounded-lg transition-colors"
                      aria-label={`Delete ${animal.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-4">
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
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editAnimal ? 'Edit Animal' : 'Add Animal'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="animal-form"
              loading={isSubmitting}
            >
              {editAnimal ? 'Save Changes' : 'Add Animal'}
            </Button>
          </>
        }
      >
        <form id="animal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="name"
            label="Name"
            placeholder="e.g. Buddy"
            error={errors.name?.message}
            {...register('name')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="species"
              label="Species"
              placeholder="Select species"
              options={speciesOptions}
              error={errors.species?.message}
              {...register('species')}
            />
            <Input
              id="breed"
              label="Breed"
              placeholder="e.g. Golden Retriever"
              error={errors.breed?.message}
              {...register('breed')}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="age_years"
              label="Age (years)"
              type="number"
              min={0}
              placeholder="e.g. 3"
              error={errors.age_years?.message}
              {...register('age_years')}
            />
            <Input
              id="age_months"
              label="Age (months)"
              type="number"
              min={0}
              max={11}
              placeholder="e.g. 6"
              error={errors.age_months?.message}
              {...register('age_months')}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="gender"
              label="Gender"
              placeholder="Select gender"
              options={genderOptions}
              error={errors.gender?.message}
              {...register('gender')}
            />
            <Select
              id="status"
              label="Status"
              options={formStatusOptions}
              error={errors.status?.message}
              {...register('status')}
            />
          </div>
          <Input
            id="intake_date"
            label="Intake Date"
            type="date"
            error={errors.intake_date?.message}
            {...register('intake_date')}
          />
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Brief description of the animal..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors resize-y"
              {...register('description')}
            />
          </div>

          {/* Vaccinated toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <span className="relative">
              <input
                type="checkbox"
                {...register('is_vaccinated')}
                className="sr-only peer"
              />
              <span className="block w-10 h-6 rounded-full bg-gray-200 peer-checked:bg-primary transition-colors" />
              <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
            </span>
            <span className="text-sm font-medium text-gray-700">Vaccinated</span>
          </label>

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-2">Current Photos</p>
              <div className="grid grid-cols-4 gap-2">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={img.image}
                      alt={img.caption || 'Animal photo'}
                      className="w-full h-20 object-cover"
                    />
                    {img.is_primary && (
                      <span className="absolute top-1 left-1 bg-primary text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(img.id)}
                      className="absolute top-1 right-1 p-0.5 bg-black/50 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload new images */}
          <FileUpload
            label="Add Photos"
            accept="image/jpeg,image/png,image/webp"
            maxFiles={Math.max(1, 5 - existingImages.length)}
            onFilesSelected={handleFilesSelected}
          />

          {uploadProgress && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading {uploadProgress.current} of {uploadProgress.total}...
            </div>
          )}

          {uploadError && (
            <Alert variant="error" onClose={() => setUploadError(null)}>
              {uploadError}
            </Alert>
          )}
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Animal"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={actionLoading}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteConfirm?.name}</span>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
