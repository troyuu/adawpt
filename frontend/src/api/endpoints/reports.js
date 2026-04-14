import api from '../client.js'

export async function getReports(params = {}) {
  const response = await api.get('/api/v1/reports/', { params })
  return response.data
}

export async function getReport(id) {
  const response = await api.get(`/api/v1/reports/${id}/`)
  return response.data
}

export async function createReport(formData) {
  const response = await api.post('/api/v1/reports/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function updateReport(id, data) {
  const response = await api.patch(`/api/v1/reports/${id}/`, data)
  return response.data
}

export async function assignVolunteer(reportId, volunteerId) {
  const response = await api.post(`/api/v1/reports/${reportId}/assign/`, {
    volunteer_id: volunteerId,
  })
  return response.data
}

export async function updateReportStatus(reportId, status, notes) {
  const response = await api.post(`/api/v1/reports/${reportId}/update-status/`, {
    status,
    notes,
  })
  return response.data
}

export async function trackReport(trackingId) {
  const response = await api.get(`/api/v1/reports/track/${trackingId}/`)
  return response.data
}
