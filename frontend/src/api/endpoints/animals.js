import api from '../client.js'

export async function getAnimals(params = {}) {
  const response = await api.get('/api/v1/animals/', { params })
  return response.data
}

export async function getAnimal(id) {
  const response = await api.get(`/api/v1/animals/${id}/`)
  return response.data
}

export async function createAnimal(data) {
  const response = await api.post('/api/v1/animals/', data)
  return response.data
}

export async function updateAnimal(id, data) {
  const response = await api.patch(`/api/v1/animals/${id}/`, data)
  return response.data
}

export async function deleteAnimal(id) {
  const response = await api.delete(`/api/v1/animals/${id}/`)
  return response.data
}

export async function getAnimalImages(animalId) {
  const response = await api.get(`/api/v1/animals/${animalId}/images/`)
  return response.data
}

export async function uploadAnimalImage(animalId, formData) {
  const response = await api.post(`/api/v1/animals/${animalId}/images/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function deleteAnimalImage(animalId, imageId) {
  const response = await api.delete(`/api/v1/animals/${animalId}/images/${imageId}/`)
  return response.data
}

export async function getMedicalRecords(animalId) {
  const response = await api.get(`/api/v1/animals/${animalId}/medical-records/`)
  return response.data
}

export async function addMedicalRecord(animalId, data) {
  const response = await api.post(`/api/v1/animals/${animalId}/medical-records/`, data)
  return response.data
}
