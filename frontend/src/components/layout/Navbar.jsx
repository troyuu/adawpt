import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { PawPrint, Menu, Bell, ChevronDown, LogOut, User, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import useNotifications from '../../hooks/useNotifications.js'
import MobileMenu from './MobileMenu.jsx'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'

const navLinks = [
  { to: '/animals', label: 'Animals' },
  { to: '/report', label: 'Report a Stray' },
  { to: '/stories', label: 'Success Stories' },
  { to: '/events', label: 'Events' },
  { to: '/donate', label: 'Donate' },
]

export default function Navbar({ mobileSlot }) {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  function getInitials(name) {
    if (!name) return '?'
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <header className="sticky top-0 z-40 h-16 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <PawPrint className="h-7 w-7 text-primary" />
            <span className="font-display text-xl font-bold text-primary">Adawpt</span>
          </Link>

          {/* Center: Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ' +
                  (location.pathname === link.to || location.pathname.startsWith(link.to + '/')
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Auth / User */}
          <div className="flex items-center gap-3">
            {!user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Notifications bell */}
                <Link
                  to="/dashboard/notifications"
                  className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4.5 min-w-4.5 px-1 rounded-full bg-danger text-white text-[10px] font-bold leading-none">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Avatar dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.full_name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                        {getInitials(user.full_name)}
                      </div>
                    )}
                    <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        to="/dashboard/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          setDropdownOpen(false)
                          setLogoutConfirm(true)
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-danger hover:bg-gray-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile menu toggle — dashboard provides its own sidebar toggle via mobileSlot */}
            <div className="lg:hidden">
              {mobileSlot || (
                <button
                  onClick={() => setMobileOpen(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Logout confirmation */}
      <Modal
        isOpen={logoutConfirm}
        onClose={() => setLogoutConfirm(false)}
        title="Confirm Logout"
        footer={
          <>
            <Button variant="outline" onClick={() => setLogoutConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setLogoutConfirm(false)
                logout()
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to log out? You will need to sign in again to access your account.
        </p>
      </Modal>
    </>
  )
}
