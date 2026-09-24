import isValid from 'helpers/signup-validators'

const { default: axios } = require('axios')
const { useState, useEffect } = require('react')

// category = ALL | BANNED | APPROVED | BUSINESS

const queriesParams = {
  ALL: {},
  BANNED: {
    isBanned: true
  },
  APPROVED: {
    isVerified: true
  },
  APPROVED_BUSINESS: {
    isVerified: true,
    isBusiness: true
  }
}

const useUserManagement = ({
  category,
  currentPage,
  currentLimit,
  searchText
}) => {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState(false)
  const [error, setError] = useState(null)
  const [metadata, setMetadata] = useState({
    limit: currentLimit,
    page: currentPage,
    pages: 1,
    total: 1
  })

  const fetchUsers = async () => {
    setLoading(true)

    try {
      let currentQueryParams = { ...queriesParams[category] }

      // Determine if it's a phone number.
      if (searchText.startsWith('+')) {
        // It's a phone number
        currentQueryParams['phone'] = searchText
      } else if (isValid.email(searchText)) {
        // It's an email
        currentQueryParams['email'] = searchText
      } else {
        // It's a username
        currentQueryParams['usernameRegex'] = searchText
      }

      const { data } = await axios.get(`/api/v3/bridge/users`, {
        params: {
          ...currentQueryParams,
          limit: currentLimit,
          page: currentPage
        }
      })
      setUsers(data.data)
      setMetadata(data.metadata)
    } catch (error) {
      console.error(error)
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [category, currentPage, currentLimit, searchText])

  return {
    users,
    loading,
    error,
    refetchUsers: fetchUsers,
    metadata
  }
}

export default useUserManagement
