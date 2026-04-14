import { useState } from 'react'
import {
  Search,
  Heart,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import useApi from '../../hooks/useApi.js'
import { formatShortDate } from '../../lib/utils.js'
import api from '../../api/client.js'
import { useToast } from '../../components/ui/Toast.jsx'
import Button from '../../components/ui/Button.jsx'
import Select from '../../components/ui/Select.jsx'
import Card from '../../components/ui/Card.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Pagination from '../../components/ui/Pagination.jsx'
import Alert from '../../components/ui/Alert.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import { ADOPTION_STATUSES } from '../../lib/constants.js'

const statusOptions = [{ value: '', label: 'All Statuses' }, ...ADOPTION_STATUSES]


function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  )
}

export default function AdoptionsManagement() {
  const { addToast } = useToast()
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detailModal, setDetailModal] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState(null)

  const params = { page, page_size: pageSize, status: statusFilter || undefined }
  const { data, loading, error, refetch } = useApi('/api/v1/adoptions/', { params })

  const adoptions = data?.data?.results || []
  const totalPages = data?.data?.total_pages || 1
  const totalCount = data?.data?.count || 0

  function handlePageSizeChange(newSize) {
    setPageSize(newSize)
    setPage(1)
  }

  function openRejectModal(id) {
    setRejectModal(id)
    setRejectionReason('')
    setReasonError('')
  }

  async function handleReject() {
    if (!rejectionReason.trim()) {
      setReasonError('Rejection reason is required.')
      return
    }
    await handleAction(rejectModal, 'reject', rejectionReason.trim())
    setRejectModal(null)
    setRejectionReason('')
    setReasonError('')
  }

  async function handleAction(id, action, rejectionReason = '') {
    setActionLoading(true)
    setActionError(null)
    try {
      const payload = {
        status: action === 'approve' ? 'approved' : 'rejected',
      }
      if (action === 'reject' && rejectionReason) {
        payload.rejection_reason = rejectionReason
      }
      await api.post(`/api/v1/adoptions/${id}/review/`, payload)
      setDetailModal(null)
      refetch()
      addToast({ message: action === 'approve' ? 'Application approved successfully.' : 'Application rejected.', type: 'success' })
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || `Failed to ${action} application.`
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
        <h1 className="text-2xl font-bold font-display text-gray-900">Adoptions</h1>
        <p className="text-sm text-gray-500 mt-1">Review and manage adoption applications</p>
      </div>

      {/* Filters */}
      <Card className="flex flex-col sm:flex-row gap-3">
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="sm:w-52"
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
        ) : adoptions.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No adoption applications"
            description={statusFilter ? 'No applications match the selected filter.' : 'No applications have been submitted yet.'}
          />
        ) : (
          <>
            <table className="w-full text-sm text-left hidden md:table">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-500">Applicant</th>
                  <th className="pb-3 font-medium text-gray-500">Animal</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500">Submitted</th>
                  <th className="pb-3 font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {adoptions.map((adoption) => (
                  <tr key={adoption.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {adoption.applicant_name ||
                            `${adoption.applicant?.first_name || ''} ${adoption.applicant?.last_name || ''}`.trim() ||
                            '--'}
                        </p>
                        <p className="text-xs text-gray-500">{adoption.applicant?.email || ''}</p>
                      </div>
                    </td>
                    <td className="py-3 text-gray-700">
                      {adoption.animal_name || adoption.animal?.name || '--'}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={adoption.status} />
                    </td>
                    <td className="py-3 text-gray-600">
                      {formatShortDate(adoption.created_at)}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetailModal(adoption)}
                          className="p-2 text-gray-400 hover:text-info hover:bg-info/5 rounded-lg transition-colors"
                          aria-label="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {(adoption.status === 'submitted' || adoption.status === 'under_review') && (
                          <>
                            <button
                              onClick={() => handleAction(adoption.id, 'approve')}
                              className="p-2 text-gray-400 hover:text-success hover:bg-success/5 rounded-lg transition-colors"
                              aria-label="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openRejectModal(adoption.id)}
                              className="p-2 text-gray-400 hover:text-danger hover:bg-danger/5 rounded-lg transition-colors"
                              aria-label="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {adoptions.map((adoption) => (
                <div key={adoption.id} className="p-3 rounded-lg border border-gray-100 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {adoption.applicant_name ||
                          `${adoption.applicant?.first_name || ''} ${adoption.applicant?.last_name || ''}`.trim() ||
                          '--'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{adoption.applicant?.email || ''}</p>
                    </div>
                    <StatusBadge status={adoption.status} />
                  </div>
                  <p className="text-sm text-gray-700">
                    Animal: <span className="font-medium">{adoption.animal_name || adoption.animal?.name || '--'}</span>
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                    <span className="text-xs text-gray-500">
                      {formatShortDate(adoption.created_at)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setDetailModal(adoption)}
                        className="p-2 text-gray-400 hover:text-info hover:bg-info/5 rounded-lg transition-colors"
                        aria-label="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {(adoption.status === 'submitted' || adoption.status === 'under_review') && (
                        <>
                          <button
                            onClick={() => handleAction(adoption.id, 'approve')}
                            className="p-2 text-gray-400 hover:text-success hover:bg-success/5 rounded-lg transition-colors"
                            aria-label="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openRejectModal(adoption.id)}
                            className="p-2 text-gray-400 hover:text-danger hover:bg-danger/5 rounded-lg transition-colors"
                            aria-label="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
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

      {/* Detail modal */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title="Adoption Application Details"
        footer={
          <div className="flex gap-2 w-full justify-between">
            <Button variant="outline" onClick={() => setDetailModal(null)}>
              Close
            </Button>
            {detailModal &&
              (detailModal.status === 'submitted' || detailModal.status === 'under_review') && (
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    onClick={() => { setDetailModal(null); openRejectModal(detailModal.id) }}
                    loading={actionLoading}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleAction(detailModal.id, 'approve')}
                    loading={actionLoading}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                </div>
              )}
          </div>
        }
      >
        {detailModal && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Applicant</p>
                <p className="font-medium text-gray-900">
                  {detailModal.applicant_name ||
                    `${detailModal.applicant?.first_name || ''} ${detailModal.applicant?.last_name || ''}`.trim() ||
                    '--'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium text-gray-900 break-all">{detailModal.applicant?.email || '--'}</p>
              </div>
              <div>
                <p className="text-gray-500">Animal</p>
                <p className="font-medium text-gray-900">
                  {detailModal.animal_name || detailModal.animal?.name || '--'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <StatusBadge status={detailModal.status} />
              </div>
              <div>
                <p className="text-gray-500">Submitted</p>
                <p className="font-medium text-gray-900">
                  {formatShortDate(detailModal.created_at)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{detailModal.applicant?.phone || '--'}</p>
              </div>
            </div>
            {detailModal.reason_to_adopt && (
              <div>
                <p className="text-gray-500">Reason for Adoption</p>
                <p className="text-gray-700 mt-1">{detailModal.reason_to_adopt}</p>
              </div>
            )}
            {detailModal.housing_type && (
              <div>
                <p className="text-gray-500">Housing Type</p>
                <p className="text-gray-700 mt-1">{detailModal.housing_type}</p>
              </div>
            )}
            {detailModal.pet_experience && (
              <div>
                <p className="text-gray-500">Pet Experience</p>
                <p className="text-gray-700 mt-1">{detailModal.pet_experience}</p>
              </div>
            )}
            {detailModal.rejection_reason && (
              <div className="p-3 bg-danger/5 border border-danger/20 rounded-lg">
                <p className="text-danger font-medium text-sm">Rejection Reason</p>
                <p className="text-gray-700 mt-1">{detailModal.rejection_reason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Rejection reason modal */}
      <Modal
        isOpen={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title="Reject Application"
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectModal(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} loading={actionLoading}>
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 mb-3">
          Please provide a reason for rejecting this application. This will be shared with the applicant.
        </p>
        <div>
          <textarea
            value={rejectionReason}
            onChange={(e) => { setRejectionReason(e.target.value); setReasonError('') }}
            placeholder="Enter rejection reason..."
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors ${
              reasonError
                ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
                : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
            }`}
          />
          {reasonError && (
            <p className="text-xs text-danger mt-1">{reasonError}</p>
          )}
        </div>
      </Modal>
    </div>
  )
}
