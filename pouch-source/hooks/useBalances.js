import { useState } from 'react'
import axios from 'axios'

export const useBalances = () => {
  const [balances, setBalances] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchBalances = async (username) => {
    try {
      setError('')
      setLoading(true)
      const res = await axios.get(
        `/api/v3/bridge/users/balances?username=${username}`,
      )
      setBalances(res.data?.data)
    } catch (err) {
      console.log('refreshBalances error:', JSON.stringify(err.response?.data))
      setError(err.response?.data?.error?.message || 'Failed to fetch balances')
      setBalances(null)
    } finally {
      setLoading(false)
    }
  }

  return { balances, fetchBalances, loading, error }
}
