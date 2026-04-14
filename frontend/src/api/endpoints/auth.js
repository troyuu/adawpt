import api from '../client.js'

export async function login(email, password) {
  const response = await api.post('/api/v1/auth/login/', { email, password })
  return response.data
}

export async function register(data) {
  const response = await api.post('/api/v1/auth/register/', data)
  return response.data
}

export async function logout() {
  const refreshToken = localStorage.getItem('refresh_token')
  const response = await api.post('/api/v1/auth/logout/', { refresh: refreshToken })
  return response.data
}

export async function getProfile() {
  const response = await api.get('/api/v1/auth/me/')
  return response.data
}

export async function updateProfile(data) {
  const response = await api.patch('/api/v1/auth/me/', data)
  return response.data
}

export async function changePassword(oldPassword, newPassword) {
  const response = await api.post('/api/v1/auth/change-password/', {
    old_password: oldPassword,
    new_password: newPassword,
  })
  return response.data
}
