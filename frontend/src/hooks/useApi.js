import { useState, useEffect, useCallback } from 'react'
import api from '../api/client.js'

/**
 * Hook for fetching data from the API.
 * Returns { data, loading, error, refetch }.
 *
 * @param {string|null} url  - endpoint to GET (pass null to skip)
 * @param {object}      opts - { params, immediate }
 */
export default function useApi(url, { params = {}, immediate = true } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate && !!url)
  const [error, setError] = useState(null)

  const fetchData = useCallback(
    async (overrideParams) => {
      if (!url) return
      setLoading(true)
      setError(null)
      try {
        const response = await api.get(url, { params: overrideParams ?? params })
        setData(response.data)
        return response.data
      } catch (err) {
        const message =
          err.response?.data?.message || err.response?.data?.detail || err.message || 'Something went wrong'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [url, JSON.stringify(params)]
  )

  useEffect(() => {
    if (immediate && url) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, immediate])

  return { data, loading, error, refetch: fetchData }
}
