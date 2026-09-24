import axios from 'axios'
import { useEffect, useState } from 'react'
import isValid from 'helpers/signup-validators'

const queriesParams = {
  FOR_MIGRATION: {
    isBanned: false,
    isIdUploaded: true,
    isForMigration: true,
    isForMigrationAccepted: false,
    isOld: true
  },
  FOR_MIGRATION_ACCEPTED: {
    isForMigrationAccepted: true
  },
  RETAKE_POUCH: {
    isIdUploaded: false,
    hasRetakeFields: true,
    isOld: true
  }
}

const useMigrationApplications = (tab, currentPage, currentLimit, searchText) => {
  const [loading, setLoading] = useState()
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)
  const [metadata, setMetadata] = useState({
    limit: currentLimit,
    page: currentPage,
    pages: 1,
    total: 1
  })

  const getUsers = async () => {
    setLoading(true)
    try {
      let currentQueryParams = { ...queriesParams[tab] }

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

      const { data } = await axios.get('/api/v3/bridge/users', {
        params: {
          ...currentQueryParams,
          limit: currentLimit,
          page: currentPage
        }
      })

      setMetadata(data.metadata)
      setUsers(data.data)
      console.log('data', data)
    } catch (error) {
      console.error(error)
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getUsers()
  }, [tab, currentPage, currentLimit, searchText])

  return {
    loading,
    users,
    refetchUsers: getUsers,
    error,
    metadata
  }
}

export default useMigrationApplications
