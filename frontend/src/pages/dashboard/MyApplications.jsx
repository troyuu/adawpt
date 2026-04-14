import { useState } from 'react'
import { Link } from 'react-router'
import {
  ClipboardList,
  ChevronRight,
  XCircle,
  Clock,
  CheckCircle,
  Circle,
  AlertCircle,
} from 'lucide-react'
import useApi from '../../hooks/useApi.js'
import { formatShortDate } from '../../lib/utils.js'
import api from '../../api/client.js'
import { useToast } from '../../components/ui/Toast.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Alert from '../../components/ui/Alert.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import Pagination from '../../components/ui/Pagination.jsx'

const statusConfig = {
  submitted: { label: 'Submitted', variant: 'warning', icon: Clock },
  under_review: { label: 'Under Review', variant: 'info', icon: AlertCircle },
  interview_scheduled: { label: 'Interview Scheduled', variant: 'primary', icon: Clock },
  approved: { label: 'Approved', variant: 'success', icon: CheckCircle },
  rejected: { label: 'Rejected', variant: 'danger', icon: XCircle },
  withdrawn: { label: 'Withdrawn', variant: 'default', icon: Circle },
  expired: { label: 'Expired', variant: 'default', icon: Circle },
}

const timelineSteps = ['submitted', 'under_review', 'approved']

function StatusTimeline({ currentStatus }) {
  const currentIdx = timelineSteps.indexOf(currentStatus)
  const isRejected = currentStatus === 'rejected'
  const isWithdrawn = currentStatus === 'withdrawn'

  if (isRejected || isWithdrawn) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className={`h-2 w-2 rounded-full ${isRejected ? 'bg-danger' : 'bg-gray-400'}`} />
        <span className={isRejected ? 'text-danger font-medium' : 'text-gray-500'}>
          {isRejected ? 'Rejected' : 'Withdrawn'}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {timelineSteps.map((step, idx) => {
        const isActive = idx <= currentIdx
        const isCurrentStep = idx === currentIdx
        const label = step.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        return (
          <div key={step} className="flex items-center gap-1">
            <div className="flex flex-col items-center">
              <div
                className={`h-3 w-3 rounded-full border-2 transition-colors ${
                  isActive
                    ? 'bg-primary border-primary'
                    : 'bg-white border-gray-300'
                } ${isCurrentStep ? 'ring-2 ring-primary/20' : ''}`}
              />
              <span className={`text-[10px] mt-1 whitespace-nowrap ${isActive ? 'text-primary font-medium' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {idx < timelineSteps.length - 1 && (
              <div className={`h-0.5 w-6 sm:w-10 mb-4 ${idx < currentIdx ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function ApplicationSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-1.5 w-10" />
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-1.5 w-10" />
              <Skeleton className="h-3 w-3 rounded-full" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default function MyApplications() {
  const { addToast } = useToast()
  const [withdrawConfirm, setWithdrawConfirm] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, loading, error, refetch } = useApi('/api/v1/adoptions/my-applications/', { params: { page, page_size: pageSize } })
  const applications = data?.data?.results || data?.data || []
  const totalPages = data?.data?.total_pages || 1
  const totalCount = data?.data?.count || 0

  function handlePageSizeChange(newSize) {
    setPageSize(newSize)
    setPage(1)
  }

  async function handleWithdraw() {
    if (!withdrawConfirm) return
    setActionLoading(true)
    setActionError(null)
    try {
      await api.post(`/api/v1/adoptions/${withdrawConfirm.id}/withdraw/`)
      setWithdrawConfirm(null)
      refetch()
      addToast({ message: 'Application withdrawn.', type: 'success' })
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || 'Failed to withdraw application.'
      setActionError(errorMsg)
      addToast({ message: errorMsg, type: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  const canWithdraw = (status) => status === 'submitted' || status === 'under_review'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900">My Applications</h1>
        <p className="text-sm text-gray-500 mt-1">Track the status of your adoption applications</p>
      </div>

      {actionError && (
        <Alert variant="error" onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      {loading ? (
        <ApplicationSkeleton />
      ) : error ? (
        <Alert variant="error">{error}</Alert>
      ) : applications.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="No applications yet"
            description="You haven't submitted any adoption applications yet."
            action={
              <Link to="/animals">
                <Button>Browse Animals</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const status = statusConfig[app.status] || statusConfig.submitted
            const StatusIcon = status.icon

            return (
              <Card key={app.id} className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {app.animal?.photo ? (
                      <img
                        src={app.animal.photo}
                        alt={app.animal?.name}
                        className="h-16 w-16 rounded-xl object-cover shrink-0 ring-1 ring-gray-100"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100/50 flex items-center justify-center shrink-0">
                        <ClipboardList className="h-6 w-6 text-primary/30" />
                      </div>
                    )}
                    <div>
                      <Link
                        to={`/animals/${app.animal?.id || app.animal_id}`}
                        className="font-semibold text-gray-900 hover:text-primary transition-colors font-display"
                      >
                        {app.animal_name || app.animal?.name || 'Unknown Animal'}
                      </Link>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant={status.variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">
                        Submitted {formatShortDate(app.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {canWithdraw(app.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setWithdrawConfirm(app)}
                      >
                        <XCircle className="h-4 w-4" />
                        Withdraw
                      </Button>
                    )}
                    <Link to={`/animals/${app.animal?.id || app.animal_id}`}>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Timeline */}
                <div className="pt-2 border-t border-gray-100">
                  <StatusTimeline currentStatus={app.status} />
                </div>

                {app.status === 'rejected' && app.rejection_reason && (
                  <div className="p-3 bg-danger/5 border border-danger/20 rounded-lg">
                    <p className="text-danger font-medium text-xs">Rejection Reason</p>
                    <p className="text-sm text-gray-700 mt-1">{app.rejection_reason}</p>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {!loading && applications.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          totalCount={totalCount}
        />
      )}

      {/* Withdraw confirmation */}
      <Modal
        isOpen={!!withdrawConfirm}
        onClose={() => setWithdrawConfirm(null)}
        title="Withdraw Application"
        footer={
          <>
            <Button variant="outline" onClick={() => setWithdrawConfirm(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleWithdraw} loading={actionLoading}>
              <XCircle className="h-4 w-4" />
              Withdraw
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to withdraw your application for{' '}
          <span className="font-semibold text-gray-900">
            {withdrawConfirm?.animal_name || withdrawConfirm?.animal?.name}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
