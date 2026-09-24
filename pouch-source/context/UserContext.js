import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useProfilePicture } from '../hooks'

export const UserContext = React.createContext({
  user: null,
  profilePicture: null,
  setUser: () => {},
  refreshUser: () => {},
  refreshProfilePicture: () => {},
  userLoading: false,
  profilePictureLoading: false
})

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const [profilePicture, setProfilePicture] = useState(null)
  const { getProfilePicture, loading: profilePictureLoading } =
    useProfilePicture()

  useEffect(() => {
    refreshUser()
    refreshProfilePicture()
  }, [])

  const refreshUser = async () => {
    setUserLoading(true)
    try {
      const res = await axios.get('/api/v0/user')
      setUser(res.data.user)
    } catch (err) {
      console.error('Failed to retrieve user.')
    } finally {
      setUserLoading(false)
    }
  }

  const refreshProfilePicture = async () => {
    const url = await getProfilePicture(user?.username || '')
    setProfilePicture(url)
  }

  return (
    <UserContext.Provider
      value={{
        user,
        profilePicture,
        setUser,
        refreshUser,
        refreshProfilePicture,
        userLoading,
        profilePictureLoading
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
