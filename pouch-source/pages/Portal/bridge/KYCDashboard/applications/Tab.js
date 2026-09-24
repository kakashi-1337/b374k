import { Box, createStyles } from '@mantine/core'
import React from 'react'

const Tab = ({ isActive, title, onClick, disabled }) => {
  const { classes } = useStyles()

  return (
    <Box
      className={
        disabled
          ? classes.disabledStyle
          : isActive
          ? classes.activeStyle
          : classes.inActiveStyle
      }
      onClick={onClick}
    >
      {title}
    </Box>
  )
}

const useStyles = createStyles((theme) => ({
  activeStyle: {
    borderRadius: 20,
    backgroundColor: '#6922FF',
    color: '#fff',
    fontWeight: 700,
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Poppins',
    cursor: 'pointer'
  },
  inActiveStyle: {
    borderRadius: 20,
    backgroundColor: '#fff',
    borderColor: '#6922FF',
    border: '1px solid',
    color: '#6922FF',
    fontWeight: 500,
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Poppins',
    cursor: 'pointer'
  },
  disabledStyle: {
    borderRadius: 20,
    backgroundColor: '#fff',
    borderColor: '#CCCCCC',
    border: '1px solid',
    color: '#CCCCCC',
    fontWeight: 500,
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Poppins'
  }
}))

export default Tab
