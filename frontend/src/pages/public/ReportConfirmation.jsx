import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { CheckCircle, Copy, Check, Home } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'

export default function ReportConfirmation() {
  const location = useLocation()
  const trackingId = location.state?.trackingId ?? 'ADWPT-0000'
  const [copied, setCopied] = useState(false)

  async function copyTrackingId() {
    try {
      await navigator.clipboard.writeText(trackingId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select text
      const el = document.getElementById('tracking-id')
      if (el) {
        const range = document.createRange()
        range.selectNodeContents(el)
        window.getSelection()?.removeAllRanges()
        window.getSelection()?.addRange(range)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-success/10 mb-6">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>

        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
          Report Submitted Successfully
        </h1>
        <p className="text-gray-500 mb-8">
          Thank you for helping a stray animal. Our team will review your report and take action as
          soon as possible.
        </p>

        {/* Tracking ID */}
        <Card className="mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Your Tracking ID</p>
          <div className="flex items-center justify-center gap-3">
            <span
              id="tracking-id"
              className="font-display text-2xl font-bold text-primary tracking-wider select-all"
            >
              {trackingId}
            </span>
            <button
              onClick={copyTrackingId}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Copy tracking ID"
            >
              {copied ? (
                <Check className="h-5 w-5 text-success" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Save this ID to check your report status later.
          </p>
        </Card>

        <Link to="/">
          <Button variant="outline" size="lg" className="w-full">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
