import {
  PawPrint,
  FileWarning,
  Heart,
  DollarSign,
  ClipboardList,
  Activity,
} from 'lucide-react'
import { Link } from 'react-router'
import { useAuth } from '../../auth/AuthContext.jsx'
import useApi from '../../hooks/useApi.js'
import Card from '../../components/ui/Card.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import Alert from '../../components/ui/Alert.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import AnimalCard from '../../components/animals/AnimalCard.jsx'

/* ---------- stat card ---------- */
function StatCard({ label, value, icon: Icon, color, to }) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary border-primary/10',
    secondary: 'bg-secondary/10 text-secondary border-secondary/10',
    success: 'bg-success/10 text-success border-success/10',
    warning: 'bg-warning/10 text-warning border-warning/10',
    danger: 'bg-danger/10 text-danger border-danger/10',
    info: 'bg-info/10 text-info border-info/10',
  }

  const content = (
    <Card hoverable={!!to} className="flex items-center gap-4">
      <div className={`flex items-center justify-center h-14 w-14 rounded-2xl border ${colorMap[color] || colorMap.primary}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold font-display text-gray-900">{value ?? '--'}</p>
      </div>
    </Card>
  )

  if (to) {
    return <Link to={to} className="block">{content}</Link>
  }
  return content
}

function StatSkeleton() {
  return (
    <Card className="flex items-center gap-4">
      <Skeleton className="h-14 w-14 rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-16" />
      </div>
    </Card>
  )
}

/* ---------- Admin dashboard ---------- */
function AdminDashboard() {
  const { data, loading, error } = useApi('/api/v1/dashboard/stats/')

  const stats = data?.data

  if (error) {
    return <Alert variant="error">{error}</Alert>
  }

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label="Total Animals"
              value={stats?.total_animals}
              icon={PawPrint}
              color="primary"
              to="/dashboard/animals"
            />
            <StatCard
              label="Pending Reports"
              value={stats?.pending_reports}
              icon={FileWarning}
              color="warning"
              to="/dashboard/reports"
            />
            <StatCard
              label="Active Adoptions"
              value={stats?.active_adoptions}
              icon={Heart}
              color="danger"
              to="/dashboard/adoptions"
            />
            <StatCard
              label="Monthly Donations"
              value={stats?.monthly_donations != null ? `$${stats.monthly_donations.toLocaleString()}` : undefined}
              icon={DollarSign}
              color="success"
              to="/dashboard/donations"
            />
          </>
        )}
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-lg font-semibold font-display text-gray-900 mb-4">Recent Activity</h2>
        <Card>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.recent_activity?.length > 0 ? (
            <ul className="divide-y divide-gray-50">
              {stats.recent_activity.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gray-50 border border-gray-100 shrink-0">
                    <Activity className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-700">{item.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">No recent activity to show.</p>
          )}
        </Card>
      </div>
    </div>
  )
}

/* ---------- User dashboard ---------- */
function UserDashboard() {
  const { data, loading, error } = useApi('/api/v1/dashboard/adopter/')

  const stats = data?.data

  if (error) {
    return <Alert variant="error">{error}</Alert>
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label="My Applications"
              value={stats?.my_applications}
              icon={ClipboardList}
              color="info"
              to="/dashboard/applications"
            />
            <StatCard
              label="My Adopted Animals"
              value={stats?.my_adopted}
              icon={Heart}
              color="danger"
              to="/dashboard/my-pets"
            />
          </>
        )}
      </div>

      {/* Recommended animals */}
      <div>
        <h2 className="text-lg font-semibold font-display text-gray-900 mb-4">Recommended for You</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-40 w-full rounded-lg mb-3" />
                <Skeleton className="h-5 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))}
          </div>
        ) : stats?.recommended?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.recommended.map((animal) => (
              <AnimalCard key={animal.id} animal={animal} />
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-sm text-gray-500 text-center py-6">
              No recommendations yet. Browse our <Link to="/animals" className="text-primary font-medium">animals page</Link> to get started.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}

/* ---------- Main ---------- */
export default function DashboardHome() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900">
          Welcome back, {user?.first_name || 'User'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here&apos;s what&apos;s happening with your Adawpt account.
        </p>
      </div>

      {user?.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
    </div>
  )
}
