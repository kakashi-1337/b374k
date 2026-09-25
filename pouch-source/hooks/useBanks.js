import axios from 'axios'
import { useEffect, useState } from 'react'

export const useBanks = () => {
  const [banks, setBanks] = useState([])
  const [loading, setLoading] = useState(false)

  const getBanks = async () => {
    try {
      setLoading(true)
      const { data: banks } = await axios.get('/api/v2/netbank/banks')

      banks.sort((a, b) =>
        a.bankName.toLowerCase() > b.bankName.toLowerCase() ? 1 : -1
      )
      setBanks(banks)
    } catch (error) {
      console.error('/api/v2/netbank/banks', error.response.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getBanks()
  }, [])

  return { loading, banks }
}
