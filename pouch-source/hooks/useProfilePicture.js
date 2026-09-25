import { useState } from 'react'
import axios from 'axios'

export const useProfilePicture = () => {
  const [loading, setLoading] = useState(false)

  const getProfilePicture = async (username, size) => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/v2/user/profile-picture', {
        params: {
          string: username,
          size
        }
      })
      return data
    } finally {
      setLoading(false)
    }
  }

  return {
    getProfilePicture,
    loading
  }
}
