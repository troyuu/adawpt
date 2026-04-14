import { useState } from 'react'
import {
  MapPin,
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  Info,
  CheckCircle,
  Clock,
  Play,
  Eye,
} from 'lucide-react'
import useApi from '../../hooks/useApi.js'
import { formatShortDate } from '../../lib/utils.js'
import api from '../../api/client.js'
import Button from '../../components/ui/Button.jsx'
import Select from '../../components/ui/Select.jsx'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Alert from '../../components/ui/Alert.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'

const urgencyConfig = {
  low: { variant: 'info', icon: Info, label: 'Low' },
  medium: { variant: 'warning', icon: AlertTriangle, label: 'Medium' },
  high: { variant: 'danger', icon: AlertCircle, label: 'High' },
  critical: { variant: 'danger', icon: AlertOctagon, label: 'Critical' },
}

const statusConfig = {
  submitted: { variant: 'warning', icon: Clock, label: 'Submitted' },
  acknowledged: { variant: 'info', icon: Clock, label: 'Acknowledged' },
  dispatched: { variant: 'primary', icon: Play, label: 'Dispatched' },
  rescued: { variant: 'success', icon: CheckCircle, label: 'Rescued' },
  sheltered: { variant: 'success', icon: CheckCircle, label: 'Sheltered' },
  closed: { variant: 'default', icon: CheckCircle, label: 'Closed' },
}

const statusUpdateOptions = [
  { value: 'acknowledged', label: 'Acknowledge' },
  { value: 'dispatched', label: 'Dispatch' },
  { value: 'rescued', label: 'Mark Rescued' },
  { value: 'sheltered', label: 'Mark Sheltered' },
  { value: 'closed', label: 'Close' },
]

function MissionSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="flex items-start gap-4">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-8 w-24" />
        </Card>
      ))}
    </div>
  )
}

export default function VolunteerMissions() {
  const [detailModal, setDetailModal] = useState(null)
  const [statusModal, setStatusModal] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState(null)

  const { data, loading, error, refetch } = useApi('/api/v1/reports/my-missions/', { params: {} })
  const missions = data?.data?.results || data?.data || []

  async function handleStatusUpdate() {
    if (!statusModal || !selectedStatus) return
    setActionLoading(true)
    setActionError(null)
    try {
      await api.post(`/api/v1/reports/${statusModal.id}/update-status/`, { status: selectedStatus })
      setStatusModal(null)
      setSelectedStatus('')
      refetch()
    } catch (err) {
      setActionError(
        err.response?.data?.message || err.response?.data?.detail || 'Failed to update status.'
      )
    } finally {
      setActionLoading(false)
    }
  }

  function formatStatus(status) {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '--'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900">My Missions</h1>
        <p className="text-sm text-gray-500 mt-1">Assigned rescue reports and missions</p>
      </div>

      {actionError && (
        <Alert variant="error" onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      {loading ? (
        <MissionSkeleton />
      ) : error ? (
        <Alert variant="error">{error}</Alert>
      ) : missions.length === 0 ? (
        <Card>
          <EmptyState
            icon={MapPin}
            title="No missions assigned"
            description="You'll see assigned rescue reports here once they're available."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {missions.map((mission) => {
            const urgency = urgencyConfig[mission.urgency] || urgencyConfig.low
            const status = statusConfig[mission.status] || statusConfig.submitted
            const UrgencyIcon = urgency.icon
            const StatusIcon = status.icon
            const isActionable = mission.status !== 'closed'

            return (
              <Card key={mission.id} className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex items-center justify-center h-10 w-10 rounded-lg shrink-0 ${
                      urgency.variant === 'danger' ? 'bg-danger/10' : urgency.variant === 'warning' ? 'bg-warning/10' : 'bg-info/10'
                    }`}>
                      <UrgencyIcon className={`h-5 w-5 ${
                        urgency.variant === 'danger' ? 'text-danger' : urgency.variant === 'warning' ? 'text-warning' : 'text-info'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 font-display">
                        {mission.tracking_id || `Mission #${mission.id}`}
                      </h3>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {mission.animal_type ? `${mission.animal_type} report` : 'Rescue mission'}
                        {mission.address && ` \u2014 ${mission.address}`}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={urgency.variant}>
                          <UrgencyIcon className="h-3 w-3 mr-1" />
                          {urgency.label}
                        </Badge>
                        <Badge variant={status.variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Reported {formatShortDate(mission.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setDetailModal(mission)}
                      className="p-2 text-gray-400 hover:text-info hover:bg-info/5 rounded-lg transition-colors"
                      aria-label="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {isActionable && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setStatusModal(mission)
                          setSelectedStatus('')
                        }}
                      >
                        Update Status
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Detail modal */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={`Mission ${detailModal?.tracking_id || ''}`}
        footer={
          <Button variant="outline" onClick={() => setDetailModal(null)}>
            Close
          </Button>
        }
      >
        {detailModal && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
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
                <Badge variant={statusConfig[detailModal.status]?.variant || 'default'}>
                  {formatStatus(detailModal.status)}
                </Badge>
              </div>
              <div>
                <p className="text-gray-500">Reported</p>
                <p className="font-medium text-gray-900">
                  {detailModal.created_at ? new Date(detailModal.created_at).toLocaleString() : '--'}
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
            {detailModal.reporter_name && (
              <div>
                <p className="text-gray-500">Reporter</p>
                <p className="text-gray-700 mt-1">{detailModal.reporter_name}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Status update modal */}
      <Modal
        isOpen={!!statusModal}
        onClose={() => setStatusModal(null)}
        title="Update Mission Status"
        footer={
          <>
            <Button variant="outline" onClick={() => setStatusModal(null)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} loading={actionLoading} disabled={!selectedStatus}>
              Update Status
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 mb-4">
          Update the status for mission{' '}
          <span className="font-semibold">{statusModal?.tracking_id}</span>.
        </p>
        <Select
          label="New Status"
          placeholder="Select a status"
          options={statusUpdateOptions.filter((opt) => {
            // Only show statuses that come after the current one
            const order = ['submitted', 'acknowledged', 'dispatched', 'rescued', 'sheltered', 'closed']
            const currentIdx = order.indexOf(statusModal?.status)
            const optIdx = order.indexOf(opt.value)
            return optIdx > currentIdx
          })}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        />
      </Modal>
    </div>
  )
}
