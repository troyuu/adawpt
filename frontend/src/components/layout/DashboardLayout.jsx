import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Menu } from 'lucide-react'
import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const sidebarToggle = (
    <button
      onClick={() => setSidebarOpen(true)}
      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      aria-label="Open sidebar"
    >
      <Menu className="h-5 w-5" />
    </button>
  )

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar mobileSlot={sidebarToggle} />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <Sidebar className="hidden lg:flex" />

        {/* Mobile sidebar overlay */}
        <div
          className={
            'fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 lg:hidden ' +
            (sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')
          }
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
        <div
          className={
            'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-hidden ' +
            (sidebarOpen ? 'translate-x-0' : '-translate-x-full')
          }
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <main className="flex-1 bg-gray-50 overflow-auto">
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
