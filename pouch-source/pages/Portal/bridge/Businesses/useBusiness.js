import axios from 'axios'

const { useState, useEffect } = require('react')

const useBusiness = () => {
  const [loading, setLoading] = useState(false)
  const [businesses, setBusinesses] = useState([])

  const fetchBusinesses = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/v0/bridge/business/list')
      setBusinesses(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBusinesses()
  }, [])

  return { loading, businesses }
}

export default useBusiness
