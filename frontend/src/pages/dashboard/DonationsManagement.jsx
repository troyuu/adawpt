import { DollarSign, TrendingUp, Users, Calendar } from 'lucide-react'
import useApi from '../../hooks/useApi.js'
import { formatShortDate } from '../../lib/utils.js'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Alert from '../../components/ui/Alert.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import Pagination from '../../components/ui/Pagination.jsx'
import { useState } from 'react'

function StatCard({ label, value, icon: Icon, color }) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    info: 'bg-info/10 text-info',
    secondary: 'bg-secondary/10 text-secondary',
  }

  return (
    <Card className="flex items-center gap-4">
      <div className={`flex items-center justify-center h-12 w-12 rounded-lg ${colorMap[color] || colorMap.primary}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold font-display text-gray-900">{value ?? '--'}</p>
      </div>
    </Card>
  )
}

function StatSkeleton() {
  return (
    <Card className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-20" />
      </div>
    </Card>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  )
}

export default function DonationsManagement() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data: statsData, loading: statsLoading, error: statsError } = useApi('/api/v1/donations/summary/')
  const { data: donationsData, loading: donationsLoading, error: donationsError } = useApi('/api/v1/donations/', { params: { page, page_size: pageSize } })

  const stats = statsData?.data
  const donations = donationsData?.data?.results || []
  const totalPages = donationsData?.data?.total_pages || 1
  const totalCount = donationsData?.data?.count || 0

  function handlePageSizeChange(newSize) {
    setPageSize(newSize)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900">Donations</h1>
        <p className="text-sm text-gray-500 mt-1">Track donations and contributions</p>
      </div>

      {/* Summary stats */}
      {statsError ? (
        <Alert variant="error">{statsError}</Alert>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statsLoading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <StatCard
                label="Total Raised"
                value={stats?.total_raised != null ? `$${stats.total_raised.toLocaleString()}` : undefined}
                icon={DollarSign}
                color="success"
              />
              <StatCard
                label="This Month"
                value={stats?.this_month != null ? `$${stats.this_month.toLocaleString()}` : undefined}
                icon={TrendingUp}
                color="primary"
              />
              <StatCard
                label="Total Donors"
                value={stats?.total_donors}
                icon={Users}
                color="info"
              />
            </>
          )}
        </div>
      )}

      {/* Recent donations table */}
      <div>
        <h2 className="text-lg font-semibold font-display text-gray-900 mb-4">Recent Donations</h2>
        <Card className="overflow-x-auto">
          {donationsLoading ? (
            <TableSkeleton />
          ) : donationsError ? (
            <Alert variant="error">{donationsError}</Alert>
          ) : donations.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No donations yet"
              description="Donations will appear here once received."
            />
          ) : (
            <>
              <table className="w-full text-sm text-left hidden md:table">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 font-medium text-gray-500">Donor</th>
                    <th className="pb-3 font-medium text-gray-500">Amount</th>
                    <th className="pb-3 font-medium text-gray-500">Type</th>
                    <th className="pb-3 font-medium text-gray-500">Date</th>
                    <th className="pb-3 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {donations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3">
                        <p className="font-medium text-gray-900">
                          {donation.donor_name ||
                            `${donation.donor?.first_name || ''} ${donation.donor?.last_name || ''}`.trim() ||
                            'Anonymous'}
                        </p>
                        {donation.donor?.email && (
                          <p className="text-xs text-gray-500">{donation.donor.email}</p>
                        )}
                      </td>
                      <td className="py-3 font-semibold text-gray-900">
                        ${Number(donation.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3">
                        <Badge variant={donation.is_recurring ? 'primary' : 'default'}>
                          {donation.is_recurring ? 'Recurring' : 'One-time'}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {formatShortDate(donation.created_at)}
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={
                            donation.payment_status === 'completed'
                              ? 'success'
                              : donation.payment_status === 'pending'
                                ? 'warning'
                                : donation.payment_status === 'failed'
                                  ? 'danger'
                                  : 'default'
                          }
                        >
                          {donation.payment_status || 'completed'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {donations.map((donation) => (
                <div key={donation.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {donation.donor_name ||
                        `${donation.donor?.first_name || ''} ${donation.donor?.last_name || ''}`.trim() ||
                        'Anonymous'}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 mt-0.5">
                      ${Number(donation.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <Badge variant={donation.is_recurring ? 'primary' : 'default'}>
                        {donation.is_recurring ? 'Recurring' : 'One-time'}
                      </Badge>
                      <Badge
                        variant={
                          donation.payment_status === 'completed'
                            ? 'success'
                            : donation.payment_status === 'pending'
                              ? 'warning'
                              : donation.payment_status === 'failed'
                                ? 'danger'
                                : 'default'
                        }
                      >
                        {donation.payment_status || 'completed'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 shrink-0">
                    {formatShortDate(donation.created_at)}
                  </p>
                </div>
              ))}
            </div>

              <div className="flex justify-center pt-4">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} pageSize={pageSize} onPageSizeChange={handlePageSizeChange} totalCount={totalCount} />
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
