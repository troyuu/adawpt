import api from '../client.js'

export async function getApplications(params = {}) {
  const response = await api.get('/api/v1/adoptions/', { params })
  return response.data
}

export async function getApplication(id) {
  const response = await api.get(`/api/v1/adoptions/${id}/`)
  return response.data
}

export async function createApplication(data) {
  const response = await api.post('/api/v1/adoptions/', data)
  return response.data
}

export async function reviewApplication(id, data) {
  const response = await api.post(`/api/v1/adoptions/${id}/review/`, data)
  return response.data
}

export async function withdrawApplication(id) {
  const response = await api.post(`/api/v1/adoptions/${id}/withdraw/`)
  return response.data
}
