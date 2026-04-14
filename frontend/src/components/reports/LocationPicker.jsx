import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Navigation, Search, MapPin, Loader2 } from 'lucide-react'

// Fix default marker icon (known Vite/Webpack issue with Leaflet)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

const DEFAULT_CENTER = [14.5995, 120.9842] // Metro Manila
const DEFAULT_ZOOM = 12
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

async function searchAddress(query) {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: '1',
    limit: '5',
    countrycodes: 'ph',
  })
  const res = await fetch(`${NOMINATIM_BASE}/search?${params}`)
  return res.json()
}

async function reverseGeocode(lat, lng) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'json',
  })
  const res = await fetch(`${NOMINATIM_BASE}/reverse?${params}`)
  const data = await res.json()
  return data.display_name || ''
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng)
    },
  })
  return null
}

function RecenterMap({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16)
    }
  }, [center, map])
  return null
}

function DraggableMarker({ position, onDragEnd }) {
  const markerRef = useRef(null)
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker) {
          onDragEnd(marker.getLatLng())
        }
      },
    }),
    [onDragEnd]
  )

  return (
    <Marker
      draggable
      position={position}
      ref={markerRef}
      eventHandlers={eventHandlers}
    />
  )
}

export default function LocationPicker({ value, onChange, error }) {
  const [position, setPosition] = useState(
    value?.lat != null ? [value.lat, value.lng] : null
  )
  const [address, setAddress] = useState(value?.address || '')
  const [flyTarget, setFlyTarget] = useState(null)
  const [geolocating, setGeolocating] = useState(false)
  const [geoError, setGeoError] = useState(null)

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef(null)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)
  // Track whether the address was just set programmatically (to skip re-searching)
  const skipSearchRef = useRef(false)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Notify parent of changes
  const emitChange = useCallback(
    (lat, lng, addr) => {
      onChange({ lat, lng, address: addr })
    },
    [onChange]
  )

  // Place pin on map + reverse geocode to fill address
  const placePin = useCallback(
    async (latlng, skipReverse = false) => {
      const pos = [latlng.lat, latlng.lng]
      setPosition(pos)
      setFlyTarget(pos)

      if (!skipReverse) {
        try {
          const addr = await reverseGeocode(latlng.lat, latlng.lng)
          skipSearchRef.current = true
          setAddress(addr)
          emitChange(latlng.lat, latlng.lng, addr)
        } catch {
          emitChange(latlng.lat, latlng.lng, address)
        }
      } else {
        emitChange(latlng.lat, latlng.lng, address)
      }
      setSuggestions([])
      setShowDropdown(false)
    },
    [address, emitChange]
  )

  // Debounced address search
  function handleAddressInput(e) {
    const val = e.target.value
    setAddress(val)
    emitChange(position?.[0] ?? null, position?.[1] ?? null, val)

    if (skipSearchRef.current) {
      skipSearchRef.current = false
      return
    }

    clearTimeout(debounceRef.current)
    if (val.trim().length < 3) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchAddress(val)
        setSuggestions(results)
        setShowDropdown(results.length > 0)
      } catch {
        setSuggestions([])
      } finally {
        setSearching(false)
      }
    }, 400)
  }

  // Select a suggestion
  function handleSelectSuggestion(item) {
    const lat = parseFloat(item.lat)
    const lng = parseFloat(item.lon)
    const addr = item.display_name
    const pos = [lat, lng]

    skipSearchRef.current = true
    setAddress(addr)
    setPosition(pos)
    setFlyTarget(pos)
    setSuggestions([])
    setShowDropdown(false)
    emitChange(lat, lng, addr)
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser')
      return
    }
    setGeolocating(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        placePin(latlng)
        setGeolocating(false)
      },
      (err) => {
        setGeoError(
          err.code === 1
            ? 'Location access denied. Please allow location access in your browser settings.'
            : 'Unable to determine your location. Please try again.'
        )
        setGeolocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div>
      {/* Address input with autocomplete */}
      <div className="relative">
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Address / Location
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            id="address"
            type="text"
            value={address}
            onChange={handleAddressInput}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder="e.g., Corner of Rizal Ave and Mabini St, Quezon City"
            className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
              error ? 'border-danger' : 'border-gray-300'
            }`}
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
          )}
        </div>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}

        {/* Suggestions dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <ul
            ref={dropdownRef}
            className="absolute z-[1000] mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((item) => (
              <li key={item.place_id}>
                <button
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-gray-900 flex items-start gap-2 transition-colors"
                >
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{item.display_name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Pin Location on Map
          </label>
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={geolocating}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors disabled:opacity-50"
          >
            <Navigation className="h-4 w-4" />
            {geolocating ? 'Locating...' : 'Use my location'}
          </button>
        </div>

        <div className="aspect-video rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            className="h-full w-full"
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onMapClick={placePin} />
            <RecenterMap center={flyTarget} />
            {position && (
              <DraggableMarker position={position} onDragEnd={placePin} />
            )}
          </MapContainer>
        </div>

        {geoError && (
          <p className="mt-2 text-xs text-danger">{geoError}</p>
        )}

        {position && (
          <p className="mt-2 text-xs text-gray-500">
            Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </p>
        )}

        <p className="mt-1 text-xs text-gray-400">
          Click on the map to place a pin, or drag the marker to adjust.
        </p>
      </div>
    </div>
  )
}
