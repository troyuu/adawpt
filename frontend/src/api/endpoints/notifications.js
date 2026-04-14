import api from '../client.js'

export async function getNotifications(params = {}) {
  const response = await api.get('/api/v1/notifications/', { params })
  return response.data
}

export async function getUnreadCount() {
  const response = await api.get('/api/v1/notifications/unread-count/')
  return response.data
}

export async function markRead(id) {
  const response = await api.post(`/api/v1/notifications/${id}/read/`)
  return response.data
}

export async function markAllRead() {
  const response = await api.post('/api/v1/notifications/mark-all-read/')
  return response.data
}
