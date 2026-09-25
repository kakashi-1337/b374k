import axios from 'axios'

const { useState, useEffect } = require('react')

const useGetCashbackTransactions = ({ page, limit, search }) => {
  const [cashbackTransactions, setCashbackTransactions] = useState([])
  const [cashbackTransactionsMetadata, setCashbackTransactionsMetadata] =
    useState({
      total: 0,
      totalPages: 0,
      currentPage: 1,
      limit: 1,
      hasNextPage: false,
      hasPrevPage: false
    })
  const [loading, setLoading] = useState(true) // should be true

  const fetchCashbackTransactions = async () => {
    try {
      setLoading(true)

      const { data } = await axios.get(
        `/api/v0/transaction/cashback/all?page=${page}&limit=${limit}&search=${search}`
      )
      setCashbackTransactions(data.cashbackTransactions)
      setCashbackTransactionsMetadata(data.cashbackTransactionsMetadata)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchCashbackTransactions()
    }, 500)

    return () => clearTimeout(delay)
  }, [search, page, limit])

  return {
    loading,
    cashbackTransactions,
    cashbackTransactionsMetadata,
    refetchCashbackTransactions: fetchCashbackTransactions
  }
}
export default useGetCashbackTransactions
