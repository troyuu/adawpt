import { useState } from 'react'
import {
  Search,
  FileWarning,
  Eye,
  UserCheck,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  Info,
} from 'lucide-react'
import useApi from '../../hooks/useApi.js'
import { formatShortDate } from '../../lib/utils.js'
import api from '../../api/client.js'
import { useToast } from '../../components/ui/Toast.jsx'
import Button from '../../components/ui/Button.jsx'
import Select from '../../components/ui/Select.jsx'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Pagination from '../../components/ui/Pagination.jsx'
import Alert from '../../components/ui/Alert.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import { REPORT_STATUSES, REPORT_URGENCIES } from '../../lib/constants.js'

const statusOptions = [{ value: '', label: 'All Statuses' }, ...REPORT_STATUSES]
const urgencyOptions = [{ value: '', label: 'All Urgency Levels' }, ...REPORT_URGENCIES]

const urgencyConfig = {
  low: { variant: 'info', icon: Info },
  medium: { variant: 'warning', icon: AlertTriangle },
  high: { variant: 'danger', icon: AlertCircle },
  critical: { variant: 'danger', icon: AlertOctagon },
}


const updateStatusOptions = [
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'rescued', label: 'Rescued' },
  { value: 'sheltered', label: 'Sheltered' },
  { value: 'closed', label: 'Closed' },
]

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  )
}

export default function ReportsManagement() {
  const { addToast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detailModal, setDetailModal] = useState(null)
  const [assignModal, setAssignModal] = useState(null)
  const [statusModal, setStatusModal] = useState(null)
  const [selectedVolunteer, setSelectedVolunteer] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState(null)

  const params = {
    page,
    page_size: pageSize,
    search: search || undefined,
    status: statusFilter || undefined,
    urgency: urgencyFilter || undefined,
  }
  const { data, loading, error, refetch } = useApi('/api/v1/reports/', { params })
  const { data: volunteersData } = useApi('/api/v1/users/', { immediate: true })

  const reports = data?.data?.results || []
  const totalPages = data?.data?.total_pages || 1
  const totalCount = data?.data?.count || 0
  const volunteers = volunteersData?.data?.results || []

  const volunteerOptions = volunteers.map((v) => ({
    value: String(v.id),
    label: `${v.first_name} ${v.last_name}`,
  }))

  function handlePageSizeChange(newSize) {
    setPageSize(newSize)
    setPage(1)
  }

  async function handleAssign() {
    if (!assignModal || !selectedVolunteer) return
    setActionLoading(true)
    setActionError(null)
    try {
      await api.post(`/api/v1/reports/${assignModal.id}/assign/`, {
        volunteer_id: selectedVolunteer,
      })
      setAssignModal(null)
      setSelectedVolunteer('')
      refetch()
      addToast({ message: 'Volunteer assigned successfully.', type: 'success' })
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || 'Failed to assign volunteer.'
      setActionError(errorMsg)
      addToast({ message: errorMsg, type: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleStatusUpdate() {
    if (!statusModal || !selectedStatus) return
    setActionLoading(true)
    setActionError(null)
    try {
      await api.post(`/api/v1/reports/${statusModal.id}/update-status/`, { status: selectedStatus })
      setStatusModal(null)
      setSelectedStatus('')
      refetch()
      addToast({ message: 'Report status updated.', type: 'success' })
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || 'Failed to update status.'
      setActionError(errorMsg)
      addToast({ message: errorMsg, type: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Manage stray and rescue reports</p>
      </div>

      {/* Filters */}
      <Card className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by tracking ID or reporter..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        </div>
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="sm:w-44"
        />
        <Select
          options={urgencyOptions}
          value={urgencyFilter}
          onChange={(e) => { setUrgencyFilter(e.target.value); setPage(1) }}
          className="sm:w-44"
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
        ) : reports.length === 0 ? (
          <EmptyState
            icon={FileWarning}
            title="No reports found"
            description="Adjust your filters or wait for new reports."
          />
        ) : (
          <>
            <table className="w-full text-sm text-left hidden md:table">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-500">Tracking ID</th>
                  <th className="pb-3 font-medium text-gray-500">Type</th>
                  <th className="pb-3 font-medium text-gray-500">Urgency</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500">Reporter</th>
                  <th className="pb-3 font-medium text-gray-500">Date</th>
                  <th className="pb-3 font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((report) => {
                  const urgency = urgencyConfig[report.urgency] || urgencyConfig.low
                  const UrgencyIcon = urgency.icon
                  return (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 font-mono text-xs text-gray-700">
                        {report.tracking_id || `RPT-${report.id}`}
                      </td>
                      <td className="py-3 text-gray-600 capitalize">{report.animal_type || '--'}</td>
                      <td className="py-3">
                        <Badge variant={urgency.variant} className="gap-1">
                          <UrgencyIcon className="h-3 w-3" />
                          {report.urgency}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="py-3 text-gray-600">
                        {report.reporter_name || report.reporter?.first_name || 'Anonymous'}
                      </td>
                      <td className="py-3 text-gray-600">
                        {formatShortDate(report.created_at)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDetailModal(report)}
                            className="p-2 text-gray-400 hover:text-info hover:bg-info/5 rounded-lg transition-colors"
                            aria-label="View report"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { setAssignModal(report); setSelectedVolunteer('') }}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                            aria-label="Assign user"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { setStatusModal(report); setSelectedStatus(report.status) }}
                            className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-colors"
                            aria-label="Update status"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {reports.map((report) => {
                const urgency = urgencyConfig[report.urgency] || urgencyConfig.low
                const UrgencyIcon = urgency.icon
                return (
                  <div key={report.id} className="p-3 rounded-lg border border-gray-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-medium text-gray-700">
                        {report.tracking_id || `RPT-${report.id}`}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatShortDate(report.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 capitalize">{report.animal_type || '--'}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant={urgency.variant} className="gap-1">
                        <UrgencyIcon className="h-3 w-3" />
                        {report.urgency}
                      </Badge>
                      <StatusBadge status={report.status} />
                    </div>
                    <div className="flex items-center gap-1 pt-1 border-t border-gray-50">
                      <button
                        onClick={() => setDetailModal(report)}
                        className="p-2 text-gray-400 hover:text-info hover:bg-info/5 rounded-lg transition-colors"
                        aria-label="View report"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { setAssignModal(report); setSelectedVolunteer('') }}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        aria-label="Assign user"
                      >
                        <UserCheck className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { setStatusModal(report); setSelectedStatus(report.status) }}
                        className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-colors"
                        aria-label="Update status"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-center pt-4">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} pageSize={pageSize} onPageSizeChange={handlePageSizeChange} totalCount={totalCount} />
            </div>
          </>
        )}
      </Card>

      {/* Detail modal */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={`Report ${detailModal?.tracking_id || ''}`}
        footer={
          <Button variant="outline" onClick={() => setDetailModal(null)}>
            Close
          </Button>
        }
      >
        {detailModal && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Type</p>
                <p className="font-medium text-gray-900 capitalize">{detailModal.animal_type || '--'}</p>
              </div>
              <div>
                <p className="text-gray-500">Urgency</p>
                <Badge variant={urgencyConfig[detailModal.urgency]?.variant || 'default'}>
                  {detailModal.urgency}
                </Badge>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <StatusBadge status={detailModal.status} />
              </div>
              <div>
                <p className="text-gray-500">Reporter</p>
                <p className="font-medium text-gray-900">
                  {detailModal.reporter_name || detailModal.reporter?.first_name || 'Anonymous'}
                </p>
              </div>
            </div>
            {detailModal.description && (
              <div>
                <p className="text-gray-500">Description</p>
                <p className="text-gray-700 mt-1">{detailModal.description}</p>
              </div>
            )}
            {detailModal.address && (
              <div>
                <p className="text-gray-500">Location</p>
                <p className="text-gray-700 mt-1">{detailModal.address}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Assign user modal */}
      <Modal
        isOpen={!!assignModal}
        onClose={() => setAssignModal(null)}
        title="Assign User"
        footer={
          <>
            <Button variant="outline" onClick={() => setAssignModal(null)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} loading={actionLoading} disabled={!selectedVolunteer}>
              <UserCheck className="h-4 w-4" />
              Assign
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 mb-4">
          Assign a user to report <span className="font-semibold">{assignModal?.tracking_id}</span>.
        </p>
        <Select
          label="User"
          placeholder="Select a user"
          options={volunteerOptions}
          value={selectedVolunteer}
          onChange={(e) => setSelectedVolunteer(e.target.value)}
        />
      </Modal>

      {/* Status update modal */}
      <Modal
        isOpen={!!statusModal}
        onClose={() => setStatusModal(null)}
        title="Update Status"
        footer={
          <>
            <Button variant="outline" onClick={() => setStatusModal(null)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} loading={actionLoading} disabled={!selectedStatus}>
              <RefreshCw className="h-4 w-4" />
              Update
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 mb-4">
          Update the status for report <span className="font-semibold">{statusModal?.tracking_id}</span>.
        </p>
        <Select
          label="Status"
          options={updateStatusOptions}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        />
      </Modal>
    </div>
  )
}
