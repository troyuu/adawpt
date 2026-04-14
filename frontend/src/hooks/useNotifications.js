import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../api/client.js'

const POLL_INTERVAL = 30000 // 30 seconds

/**
 * Notifications hook that polls the API for unread count
 * and fetches the notification list.
 */
export default function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const intervalRef = useRef(null)

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/api/v1/notifications/unread-count/')
      const data = response.data?.data || response.data
      setUnreadCount(data.unread_count ?? 0)
    } catch {
      // Silently ignore — user may not be authenticated
    }
  }, [])

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/api/v1/notifications/')
      const data = response.data?.data
      const list = data?.results || (Array.isArray(data) ? data : [])
      setNotifications(list)
      setUnreadCount(list.filter((n) => !n.is_read).length)
    } catch {
      // Silently ignore
    }
  }, [])

  const markRead = useCallback(async (id) => {
    try {
      await api.post(`/api/v1/notifications/${id}/read/`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // Silently ignore
    }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      await api.post('/api/v1/notifications/mark-all-read/')
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch {
      // Silently ignore
    }
  }, [])

  // Poll unread count on mount and at interval
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    fetchUnreadCount()
    intervalRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL)
    return () => clearInterval(intervalRef.current)
  }, [fetchUnreadCount])

  return { notifications, unreadCount, markRead, markAllRead, fetchNotifications, fetchUnreadCount }
}
