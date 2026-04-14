import { useState } from 'react'
import {
  Heart,
  HandHeart,
  QrCode,
  Smartphone,
} from 'lucide-react'
import Card from '../../components/ui/Card.jsx'
import Alert from '../../components/ui/Alert.jsx'
import gcashQr from '../../assets/gcash-qr.png'
import mayaQr from '../../assets/maya-qr.png'

const paymentMethods = [
  {
    id: 'gcash',
    name: 'GCash',
    image: gcashQr,
    color: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50 border-blue-200',
    bgActive: 'ring-blue-500',
    textColor: 'text-blue-600',
  },
  {
    id: 'maya',
    name: 'Maya',
    image: mayaQr,
    color: 'from-green-500 to-green-600',
    bgLight: 'bg-green-50 border-green-200',
    bgActive: 'ring-green-500',
    textColor: 'text-green-600',
  },
]

export default function DonationPage() {
  const [selected, setSelected] = useState('gcash')

  const activeMethod = paymentMethods.find((m) => m.id === selected)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
            <HandHeart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
            Support Our Mission
          </h1>
          <p className="mt-3 text-gray-500 max-w-lg mx-auto">
            Every peso counts. Your donation helps us rescue, rehabilitate, and rehome stray
            animals in need of a loving family.
          </p>
        </div>

        {/* Payment Method Selector */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => setSelected(method.id)}
              className={`relative flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                selected === method.id
                  ? `${method.bgLight} ring-2 ${method.bgActive}`
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center shrink-0`}>
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <span className={`font-display text-lg font-bold ${selected === method.id ? method.textColor : 'text-gray-700'}`}>
                {method.name}
              </span>
            </button>
          ))}
        </div>

        {/* QR Code Display */}
        <Card className="text-center">
          <div className="mb-4">
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r ${activeMethod.color} text-white`}>
              <QrCode className="h-4 w-4" />
              {activeMethod.name} QR Code
            </span>
          </div>

          <div className="flex justify-center mb-5">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm inline-block">
              <img
                src={activeMethod.image}
                alt={`${activeMethod.name} QR Code`}
                className="w-64 h-64 object-contain"
              />
            </div>
          </div>

          <p className="text-gray-500 text-sm mb-2">
            Open your <strong className={activeMethod.textColor}>{activeMethod.name}</strong> app and scan this QR code to donate.
          </p>
          <p className="text-xs text-gray-400">
            Specify your preferred amount when scanning.
          </p>
        </Card>

        {/* How to Donate Steps */}
        <Card className="mt-6">
          <h3 className="font-display text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            How to Donate
          </h3>
          <ol className="space-y-3">
            {[
              `Open your ${activeMethod.name} app on your phone.`,
              'Tap "Scan QR" or the QR scanner icon.',
              'Point your camera at the QR code above.',
              'Enter the amount you wish to donate and confirm.',
            ].map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-sm text-gray-600">{step}</span>
              </li>
            ))}
          </ol>
        </Card>

        {/* Info */}
        <div className="mt-6">
          <Alert variant="info" title="Every donation matters">
            All donations go directly to rescuing, caring for, and rehoming stray animals.
            Thank you for your generosity!
          </Alert>
        </div>

        {/* Heart decoration */}
        <div className="mt-8 text-center">
          <Heart className="h-8 w-8 text-primary/20 mx-auto" />
        </div>
      </div>
    </div>
  )
}
