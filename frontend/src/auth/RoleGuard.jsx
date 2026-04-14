import { Link, Outlet } from 'react-router'
import { ShieldX } from 'lucide-react'
import { useAuth } from './AuthContext.jsx'

export default function RoleGuard({ roles, children }) {
  const { user } = useAuth()

  if (!user || !roles.includes(user.role)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ShieldX className="h-16 w-16 text-danger mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-500 mb-6">
            You do not have permission to access this page. Please contact an administrator if you
            believe this is an error.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return children || <Outlet />
}
