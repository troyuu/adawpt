import api from '../client.js'

export async function getDonations(params = {}) {
  const response = await api.get('/api/v1/donations/', { params })
  return response.data
}

export async function createDonation(data) {
  const response = await api.post('/api/v1/donations/', data)
  return response.data
}

export async function getDonationSummary() {
  const response = await api.get('/api/v1/donations/summary/')
  return response.data
}
