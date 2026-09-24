import axios from 'axios'
import { useEffect, useState } from 'react'

// timeframe = TODAY | THIS_WEEK | THIS_MONTH | THIS_YEAR | ALL
const useAuditTrails = (timeframe) => {
  const [loading, setLoading] = useState(false)
  const [auditTrails, setAuditTrails] = useState([])

  const getAuditTrails = async () => {
    setLoading(true)

    try {
      const { data } = await axios.get(
        `/api/v3/bridge/kyc-dashboard/audit-trails?timeframe=${timeframe}`
      )

      setAuditTrails(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAuditTrails()
  }, [timeframe])

  return { loading, auditTrails, refetchAuditTrails: getAuditTrails }
}

export default useAuditTrails
