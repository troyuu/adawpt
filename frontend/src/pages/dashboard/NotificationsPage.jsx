import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Heart,
  FileWarning,
  DollarSign,
  Info,
} from 'lucide-react'
import useApi from '../../hooks/useApi.js'
import { formatLongDate, formatTime } from '../../lib/utils.js'
import api from '../../api/client.js'
import { useToast } from '../../components/ui/Toast.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Alert from '../../components/ui/Alert.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import Pagination from '../../components/ui/Pagination.jsx'

const typeIcons = {
  adoption_application: Heart,
  adoption_status: Heart,
  new_report: FileWarning,
  report_assigned: FileWarning,
  report_status: FileWarning,
  new_donation: DollarSign,
  system: Info,
}

function getTypeIcon(type) {
  return typeIcons[type] || Bell
}

function getNotificationLink(notification) {
  if (notification.link) return notification.link
  const { notification_type, data } = notification
  if (notification_type === 'adoption_status' || notification_type === 'adoption_application') {
    return '/dashboard/applications'
  }
  if (notification_type === 'new_report' || notification_type === 'report_assigned' || notification_type === 'report_status') {
    return '/dashboard/reports'
  }
  if (notification_type === 'new_donation') {
    return '/dashboard/donations'
  }
  return null
}

function groupByDate(notifications) {
  const groups = {}
  for (const notification of notifications) {
    const dateStr = notification.created_at
      ? formatLongDate(notification.created_at) || 'Unknown Date'
      : 'Unknown Date'
    if (!groups[dateStr]) {
      groups[dateStr] = []
    }
    groups[dateStr].push(notification)
  }
  return groups
}

function NotificationSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 2 }).map((_, gi) => (
        <div key={gi}>
          <Skeleton className="h-5 w-40 mb-3" />
          <Card className="p-0 overflow-hidden divide-y divide-gray-50">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </Card>
        </div>
      ))}
    </div>
  )
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [actionError, setActionError] = useState(null)
  const [markingAll, setMarkingAll] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, loading, error, refetch } = useApi('/api/v1/notifications/', { params: { page, page_size: pageSize } })
  const notifications = data?.data?.results || data?.data || []
  const totalPages = data?.data?.total_pages || 1
  const totalCount = data?.data?.count || 0

  function handlePageSizeChange(newSize) {
    setPageSize(newSize)
    setPage(1)
  }

  const grouped = groupByDate(notifications)
  const hasUnread = notifications.some((n) => !n.is_read)

  async function markAsRead(id) {
    try {
      await api.post(`/api/v1/notifications/${id}/read/`)
      refetch()
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to mark as read.'
      setActionError(errorMsg)
      addToast({ message: errorMsg, type: 'error' })
    }
  }

  async function markAllAsRead() {
    setMarkingAll(true)
    setActionError(null)
    try {
      await api.post('/api/v1/notifications/mark-all-read/')
      refetch()
      addToast({ message: 'All notifications marked as read.', type: 'success' })
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to mark all as read.'
      setActionError(errorMsg)
      addToast({ message: errorMsg, type: 'error' })
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Stay up to date with your account activity</p>
        </div>
        {hasUnread && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} loading={markingAll}>
            <CheckCheck className="h-4 w-4" />
            Mark All as Read
          </Button>
        )}
      </div>

      {actionError && (
        <Alert variant="error" onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      {loading ? (
        <NotificationSkeleton />
      ) : error ? (
        <Alert variant="error">{error}</Alert>
      ) : notifications.length === 0 ? (
        <Card>
          <EmptyState
            icon={BellOff}
            title="No notifications"
            description="You're all caught up! New notifications will appear here."
          />
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{date}</h2>
              <Card className="p-0 overflow-hidden divide-y divide-gray-50">
                {items.map((notification) => {
                  const Icon = getTypeIcon(notification.notification_type)
                  const isUnread = !notification.is_read
                  const link = getNotificationLink(notification)

                  return (
                    <div
                      key={notification.id}
                      onClick={() => {
                        if (link) {
                          if (!notification.is_read) markAsRead(notification.id)
                          navigate(link)
                        }
                      }}
                      className={`flex items-start gap-3 px-5 py-4 transition-colors ${
                        link ? 'cursor-pointer hover:bg-gray-50/80' : ''
                      } ${
                        isUnread
                          ? 'bg-primary/[0.03] border-l-[3px] border-l-primary'
                          : ''
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center h-10 w-10 rounded-xl shrink-0 ${
                          isUnread ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-gray-400 border border-gray-100'
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm leading-snug ${
                            isUnread ? 'font-semibold text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {notification.title || notification.message}
                        </p>
                        {notification.title && notification.message && (
                          <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{notification.message}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1.5">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                      {isUnread && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markAsRead(notification.id) }}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors shrink-0"
                          aria-label="Mark as read"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </Card>
            </div>
          ))}
        </div>
      )}

      {!loading && notifications.length > 0 && (
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
