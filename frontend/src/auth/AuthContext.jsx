import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      const controller = new AbortController()
      fetchUser(controller.signal)
      return () => controller.abort()
    } else {
      setLoading(false)
    }
  }, [])

  async function fetchUser(signal) {
    try {
      const response = await api.get('/api/v1/auth/me/', { signal })
      setUser(response.data.data)
    } catch (error) {
      // Ignore aborted requests (page refresh / StrictMode unmount)
      // Don't touch loading state — the next mount will handle it
      if (error.code === 'ERR_CANCELED') return
      // Only clear tokens on actual 401 responses, NOT on network errors
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setUser(null)
      }
    }
    setLoading(false)
  }

  async function login(email, password) {
    const response = await api.post('/api/v1/auth/login/', { email, password })
    const { tokens, ...userData } = response.data.data
    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    setUser(userData)
    return userData
  }

  async function register(data) {
    const response = await api.post('/api/v1/auth/register/', data)
    const { tokens, ...userData } = response.data.data
    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    setUser(userData)
    return userData
  }

  async function logout() {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        await api.post('/api/v1/auth/logout/', { refresh: refreshToken })
      }
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setUser(null)
    }
  }

  const value = { user, loading, login, register, logout, fetchUser }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
