import api from '../client.js'

export async function getStories(params = {}) {
  const response = await api.get('/api/v1/content/stories/', { params })
  return response.data
}

export async function getStory(slug) {
  const response = await api.get(`/api/v1/content/stories/${slug}/`)
  return response.data
}

export async function getEvents(params = {}) {
  const response = await api.get('/api/v1/content/events/', { params })
  return response.data
}

export async function getEvent(slug) {
  const response = await api.get(`/api/v1/content/events/${slug}/`)
  return response.data
}
