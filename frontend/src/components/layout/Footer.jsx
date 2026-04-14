import { Link } from 'react-router'
import { PawPrint, Mail, Phone, MapPin } from 'lucide-react'

const quickLinks = [
  { to: '/animals', label: 'Browse Animals' },
  { to: '/report', label: 'Report a Stray' },
  { to: '/donate', label: 'Donate' },
  { to: '/events', label: 'Events' },
  { to: '/stories', label: 'Success Stories' },
]

const resources = [
  { to: '/about', label: 'About Us' },
  { to: '/faq', label: 'FAQ' },
  { to: '/volunteer', label: 'Volunteer' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <PawPrint className="h-7 w-7 text-primary" />
              <span className="font-display text-xl font-bold text-white">Adawpt</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Connecting stray animals with loving homes. Report strays, adopt pets, and help
              build a kinder community for animals in need.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              {resources.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span className="text-sm text-gray-400">hello@adawpt.org</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span className="text-sm text-gray-400">+63 2 8123 4567</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span className="text-sm text-gray-400">
                  Quezon City, Metro Manila, Philippines
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            &copy; 2026 Adawpt. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Made with love for animals everywhere.
          </p>
        </div>
      </div>
    </footer>
  )
}
