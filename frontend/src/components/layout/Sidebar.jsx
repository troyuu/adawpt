import { Link, useLocation } from 'react-router'
import {
  LayoutDashboard,
  PawPrint,
  AlertTriangle,
  Heart,
  HandHeart,
  Users,
  FileText,
  Settings,
  ClipboardList,
  MapPin,
  X,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'

const roleNavItems = {
  admin: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/animals', label: 'Animals', icon: PawPrint },
    { to: '/dashboard/reports', label: 'Reports', icon: AlertTriangle },
    { to: '/dashboard/adoptions', label: 'Adoptions', icon: Heart },
    { to: '/dashboard/donations', label: 'Donations', icon: HandHeart },
    { to: '/dashboard/users', label: 'Users', icon: Users },
    { to: '/dashboard/content', label: 'Content', icon: FileText },
    { to: '/dashboard/settings', label: 'Settings', icon: Settings },
  ],
  shelter_staff: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/animals', label: 'Animals', icon: PawPrint },
    { to: '/dashboard/reports', label: 'Reports', icon: AlertTriangle },
    { to: '/dashboard/adoptions', label: 'Adoptions', icon: Heart },
    { to: '/dashboard/content', label: 'Content', icon: FileText },
    { to: '/dashboard/missions', label: 'Missions', icon: MapPin },
  ],
  volunteer: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/missions', label: 'My Missions', icon: MapPin },
  ],
  user: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/applications', label: 'My Applications', icon: ClipboardList },
    { to: '/dashboard/my-pets', label: 'My Pets', icon: PawPrint },
  ],
}

export default function Sidebar({ className = '', onClose }) {
  const { user } = useAuth()
  const location = useLocation()

  const role = user?.role || 'user'
  const navItems = roleNavItems[role] || roleNavItems.user

  function isActive(to) {
    if (to === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname === to || location.pathname.startsWith(to + '/')
  }

  return (
    <aside className={'w-64 bg-white border-r border-gray-200 h-full flex flex-col ' + className}>
      {/* Close button for mobile overlay */}
      {onClose && (
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200 shrink-0">
          <span className="font-display text-sm font-semibold text-gray-900">Menu</span>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ' +
                (active
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User info at bottom */}
      {user && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.full_name}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                {user.full_name
                  ? user.full_name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : '?'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
              <p className="text-xs text-gray-500 capitalize">{role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
