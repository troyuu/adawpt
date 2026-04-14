import { useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { X, PawPrint } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'

const navLinks = [
  { to: '/animals', label: 'Animals' },
  { to: '/report', label: 'Report a Stray' },
  { to: '/stories', label: 'Success Stories' },
  { to: '/events', label: 'Events' },
  { to: '/donate', label: 'Donate' },
]

export default function MobileMenu({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  // Prevent body scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on route change
  useEffect(() => {
    onClose()
  }, [location.pathname])

  return (
    <>
      {/* Backdrop */}
      <div
        className={
          'fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ' +
          (isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')
        }
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div
        className={
          'fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ' +
          (isOpen ? 'translate-x-0' : '-translate-x-full')
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link to="/" className="flex items-center gap-2" onClick={onClose}>
            <PawPrint className="h-7 w-7 text-primary" />
            <span className="font-display text-xl font-bold text-primary">Adawpt</span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={
                'block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ' +
                (location.pathname === link.to || location.pathname.startsWith(link.to + '/')
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          {!user ? (
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={onClose}
                className="block w-full text-center px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                to="/dashboard"
                onClick={onClose}
                className="block w-full text-center px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  onClose()
                  logout()
                }}
                className="block w-full text-center px-4 py-2.5 text-sm font-medium text-danger border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
