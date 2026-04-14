import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  BookOpen,
  CalendarDays,
  Globe,
  EyeOff,
} from 'lucide-react'
import useApi from '../../hooks/useApi.js'
import { formatShortDate } from '../../lib/utils.js'
import api from '../../api/client.js'
import { useToast } from '../../components/ui/Toast.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Tabs from '../../components/ui/Tabs.jsx'
import Alert from '../../components/ui/Alert.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import Pagination from '../../components/ui/Pagination.jsx'
import FileUpload from '../../components/ui/FileUpload.jsx'

const storySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().optional(),
  body: z.string().min(1, 'Content is required'),
})

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  start_date: z.string().min(1, 'Date is required'),
  location: z.string().optional(),
})

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  )
}

/* ---------- Stories Tab ---------- */
function StoriesTab() {
  const { addToast } = useToast()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [imageFile, setImageFile] = useState(null)

  const { data, loading, error, refetch } = useApi('/api/v1/content/stories/', { params: { page, page_size: pageSize } })
  const stories = data?.data?.results || []
  const totalPages = data?.data?.total_pages || 1
  const totalCount = data?.data?.count || 0

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(storySchema) })

  function handlePageSizeChange(newSize) {
    setPageSize(newSize)
    setPage(1)
  }

  function openAdd() {
    setEditItem(null)
    setImageFile(null)
    reset({ title: '', excerpt: '', body: '' })
    setModalOpen(true)
  }

  function openEdit(story) {
    setEditItem(story)
    setImageFile(null)
    reset({ title: story.title, excerpt: story.excerpt || '', body: story.body || '' })
    setModalOpen(true)
  }

  async function onSubmit(values) {
    setActionError(null)
    try {
      const formData = new FormData()
      formData.append('title', values.title)
      formData.append('body', values.body)
      if (values.excerpt) formData.append('excerpt', values.excerpt)
      if (imageFile) formData.append('featured_image', imageFile)

      const config = { headers: { 'Content-Type': 'multipart/form-data' } }
      if (editItem) {
        await api.patch(`/api/v1/content/stories/${editItem.slug}/`, formData, config)
      } else {
        await api.post('/api/v1/content/stories/', formData, config)
      }
      setModalOpen(false)
      refetch()
      addToast({ message: editItem ? 'Story updated successfully.' : 'Story created successfully.', type: 'success' })
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || 'Failed to save story.'
      setActionError(errorMsg)
      addToast({ message: errorMsg, type: 'error' })
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return
    setActionLoading(true)
    try {
      await api.delete(`/api/v1/content/stories/${deleteConfirm.slug}/`)
      setDeleteConfirm(null)
      refetch()
      addToast({ message: 'Story deleted.', type: 'success' })
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete story.'
      setActionError(errorMsg)
      addToast({ message: errorMsg, type: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  async function togglePublish(story) {
    try {
      await api.patch(`/api/v1/content/stories/${story.slug}/`, {
        is_published: !story.is_published,
      })
      refetch()
      addToast({ message: story.is_published ? 'Story unpublished.' : 'Story published.', type: 'success' })
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update publish status.'
      setActionError(errorMsg)
      addToast({ message: errorMsg, type: 'error' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{data?.data?.count ?? 0} stories total</p>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          New Story
        </Button>
      </div>

      {actionError && (
        <Alert variant="error" onClose={() => setActionError(null)}>{actionError}</Alert>
      )}

      <Card className="overflow-x-auto">
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <Alert variant="error">{error}</Alert>
        ) : stories.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No stories yet"
            description="Create your first success story."
            action={<Button size="sm" onClick={openAdd}><Plus className="h-4 w-4" />New Story</Button>}
          />
        ) : (
          <>
            <table className="w-full text-sm text-left hidden md:table">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-500">Title</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500">Created</th>
                  <th className="pb-3 font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stories.map((story) => (
                  <tr key={story.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-900 max-w-xs truncate">{story.title}</td>
                    <td className="py-3">
                      <Badge variant={story.is_published ? 'success' : 'default'}>
                        {story.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="py-3 text-gray-600">
                      {formatShortDate(story.created_at)}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => togglePublish(story)}
                          className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-colors"
                          aria-label={story.is_published ? 'Unpublish' : 'Publish'}
                          title={story.is_published ? 'Unpublish' : 'Publish'}
                        >
                          {story.is_published ? <EyeOff className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => openEdit(story)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          aria-label="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(story)}
                          className="p-2 text-gray-400 hover:text-danger hover:bg-danger/5 rounded-lg transition-colors"
                          aria-label="Delete"
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
              {stories.map((story) => (
                <div key={story.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{story.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant={story.is_published ? 'success' : 'default'}>
                        {story.is_published ? 'Published' : 'Draft'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatShortDate(story.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => togglePublish(story)}
                      className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-colors"
                      aria-label={story.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {story.is_published ? <EyeOff className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => openEdit(story)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                      aria-label="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(story)}
                      className="p-2 text-gray-400 hover:text-danger hover:bg-danger/5 rounded-lg transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center pt-4">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} pageSize={pageSize} onPageSizeChange={handlePageSizeChange} totalCount={totalCount} />
            </div>
          </>
        )}
      </Card>

      {/* Add/Edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Story' : 'New Story'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" form="story-form" loading={isSubmitting}>
              {editItem ? 'Save Changes' : 'Create Story'}
            </Button>
          </>
        }
      >
        <form id="story-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input id="title" label="Title" placeholder="Story title" error={errors.title?.message} {...register('title')} />
          <Input id="excerpt" label="Excerpt" placeholder="Short summary" error={errors.excerpt?.message} {...register('excerpt')} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
            {editItem?.featured_image && !imageFile && (
              <div className="mb-2">
                <img src={editItem.featured_image} alt="Current" className="h-32 w-full object-cover rounded-lg" />
                <p className="text-xs text-gray-400 mt-1">Current image — upload a new one to replace it</p>
              </div>
            )}
            <FileUpload
              accept="image/*"
              maxFiles={1}
              onFilesSelected={(files) => setImageFile(files[0] || null)}
            />
          </div>
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              id="body"
              rows={6}
              placeholder="Write the story content..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors resize-y"
              {...register('body')}
            />
            {errors.body && <p className="mt-1 text-xs text-danger">{errors.body.message}</p>}
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Story"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={actionLoading}>
              <Trash2 className="h-4 w-4" />Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteConfirm?.title}</span>?
        </p>
      </Modal>
    </div>
  )
}

/* ---------- Events Tab ---------- */
function EventsTab() {
  const { addToast } = useToast()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState(null)

  const { data, loading, error, refetch } = useApi('/api/v1/content/events/', { params: { page, page_size: pageSize } })
  const events = data?.data?.results || []
  const totalPages = data?.data?.total_pages || 1
  const totalCount = data?.data?.count || 0

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(eventSchema) })

  function handlePageSizeChange(newSize) {
    setPageSize(newSize)
    setPage(1)
  }

  function openAdd() {
    setEditItem(null)
    reset({ title: '', description: '', start_date: '', location: '' })
    setModalOpen(true)
  }

  function openEdit(event) {
    setEditItem(event)
    reset({
      title: event.title,
      description: event.description || '',
      start_date: event.start_date?.slice(0, 10) || '',
      location: event.location || '',
    })
    setModalOpen(true)
  }

  async function onSubmit(values) {
    setActionError(null)
    try {
      if (editItem) {
        await api.patch(`/api/v1/content/events/${editItem.id}/`, values)
      } else {
        await api.post('/api/v1/content/events/', values)
      }
      setModalOpen(false)
      refetch()
      addToast({ message: editItem ? 'Event updated successfully.' : 'Event created successfully.', type: 'success' })
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || 'Failed to save event.'
      setActionError(errorMsg)
      addToast({ message: errorMsg, type: 'error' })
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return
    setActionLoading(true)
    try {
      await api.delete(`/api/v1/content/events/${deleteConfirm.id}/`)
      setDeleteConfirm(null)
      refetch()
      addToast({ message: 'Event deleted.', type: 'success' })
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete event.'
      setActionError(errorMsg)
      addToast({ message: errorMsg, type: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  async function togglePublish(event) {
    try {
      await api.patch(`/api/v1/content/events/${event.id}/`, {
        is_published: !event.is_published,
      })
      refetch()
      addToast({ message: event.is_published ? 'Event unpublished.' : 'Event published.', type: 'success' })
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update publish status.'
      setActionError(errorMsg)
      addToast({ message: errorMsg, type: 'error' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{data?.data?.count ?? 0} events total</p>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          New Event
        </Button>
      </div>

      {actionError && (
        <Alert variant="error" onClose={() => setActionError(null)}>{actionError}</Alert>
      )}

      <Card className="overflow-x-auto">
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <Alert variant="error">{error}</Alert>
        ) : events.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No events yet"
            description="Create your first event."
            action={<Button size="sm" onClick={openAdd}><Plus className="h-4 w-4" />New Event</Button>}
          />
        ) : (
          <>
            <table className="w-full text-sm text-left hidden md:table">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-500">Title</th>
                  <th className="pb-3 font-medium text-gray-500">Date</th>
                  <th className="pb-3 font-medium text-gray-500">Location</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-900 max-w-xs truncate">{event.title}</td>
                    <td className="py-3 text-gray-600">
                      {formatShortDate(event.start_date)}
                    </td>
                    <td className="py-3 text-gray-600">{event.location || '--'}</td>
                    <td className="py-3">
                      <Badge variant={event.is_published ? 'success' : 'default'}>
                        {event.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => togglePublish(event)}
                          className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-colors"
                          aria-label={event.is_published ? 'Unpublish' : 'Publish'}
                          title={event.is_published ? 'Unpublish' : 'Publish'}
                        >
                          {event.is_published ? <EyeOff className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => openEdit(event)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          aria-label="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(event)}
                          className="p-2 text-gray-400 hover:text-danger hover:bg-danger/5 rounded-lg transition-colors"
                          aria-label="Delete"
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
              {events.map((event) => (
                <div key={event.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{event.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatShortDate(event.start_date)}
                      {event.location ? ` · ${event.location}` : ''}
                    </p>
                    <div className="mt-1.5">
                      <Badge variant={event.is_published ? 'success' : 'default'}>
                        {event.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => togglePublish(event)}
                      className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-colors"
                      aria-label={event.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {event.is_published ? <EyeOff className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => openEdit(event)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                      aria-label="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(event)}
                      className="p-2 text-gray-400 hover:text-danger hover:bg-danger/5 rounded-lg transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center pt-4">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} pageSize={pageSize} onPageSizeChange={handlePageSizeChange} totalCount={totalCount} />
            </div>
          </>
        )}
      </Card>

      {/* Add/Edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Event' : 'New Event'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" form="event-form" loading={isSubmitting}>
              {editItem ? 'Save Changes' : 'Create Event'}
            </Button>
          </>
        }
      >
        <form id="event-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input id="event-title" label="Title" placeholder="Event title" error={errors.title?.message} {...register('title')} />
          <Input id="event-date" label="Date" type="date" error={errors.start_date?.message} {...register('start_date')} />
          <Input id="event-location" label="Location" placeholder="Event location" error={errors.location?.message} {...register('location')} />
          <div>
            <label htmlFor="event-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="event-description"
              rows={4}
              placeholder="Event description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors resize-y"
              {...register('description')}
            />
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Event"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={actionLoading}>
              <Trash2 className="h-4 w-4" />Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteConfirm?.title}</span>?
        </p>
      </Modal>
    </div>
  )
}

/* ---------- Main ---------- */
export default function ContentManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900">Content</h1>
        <p className="text-sm text-gray-500 mt-1">Manage success stories and events</p>
      </div>

      <Tabs
        tabs={[
          { id: 'stories', label: 'Stories', content: <StoriesTab /> },
          { id: 'events', label: 'Events', content: <EventsTab /> },
        ]}
        defaultTab="stories"
      />
    </div>
  )
}
