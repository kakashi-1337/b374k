import axios from 'axios'

export const onViewTransactions = (username) => {
  window.open(`${
    process.env.REACT_APP_POUCH_WEB_URL || 'http://localhost:5173'
  }/bridge/transactions/${username}` , '_blank').focus()
}

export const onDeleteUser = async (user) => {
  console.log('user', user)
  if (
    window.confirm(
      'Are you sure? A user may be deleted if they have no balance, and are not already approved'
    )
  ) {
    try {
      await axios.put('/api/v0/bridge/user/manual-review', {
        username: user.username,
        action: 'delete'
      })
    } catch (error) {
      alert('Something went wrong deleting user')
      console.error(error)
    }
  }
}

export const onBanUser = async (user, isBan) => {
  if (window.confirm('Are you sure you want to ban this user?')) {
    try {
      await axios.put('/api/v0/bridge/user/ban', {
        username: user.username,
        ban: isBan
      })
    } catch (error) {
      alert('Something went wrong banning user')
      console.error(error)
    }
  }
}

export const onUnapproveUser = async (user) => {
  if (window.confirm('Are you sure you want to unapprove this user?')) {
    try {
      await axios.put('/api/v0/bridge/user/manual-review', {
        username: user.username,
        action: 'unapprove'
      })
    } catch (error) {
      alert('Something went wrong unapproving the user')
      console.error(error)
    }
  }
}

export const onMakeUserAmbassador = async (user, makeAmbassador) => {
  if (
    window.confirm(
      `Are you sure you want to ${
        makeAmbassador ? 'make' : 'remove'
      } this user as ambassador?`
    )
  ) {
    try {
      await axios.put('/api/v0/bridge/user/ambassador', {
        username: user.username,
        makeAmbassador
      })
    } catch (error) {
      alert('Something went wrong making/removing user as ambassador.')
      console.error(error)
    }
  }
}

// returns - Approved, Unapproved, Banned,
export const getUserStatusText = (user) => {
  if (isUserBanned(user) && isUserApproved(user)) {
    return 'Approved & Banned'
  } else if (isUserApproved(user)) {
    return 'Approved'
  } else if (isUserBanned(user)) {
    return 'Banned'
  } else {
    return 'Unapproved'
  }
}

export const isUserBanned = (user) => {
  return user.banned
}

export const isUserApproved = (user) => {
  return user.isIdUploaded && user.isVerified
}
