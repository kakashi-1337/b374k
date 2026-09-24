import { Box, createStyles } from '@mantine/core'
import React from 'react'

const Tab = ({ isActive, title, onClick }) => {
  const { classes } = useStyles()

  return (
    <Box
      className={isActive ? classes.activeStyle : classes.inActiveStyle}
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
  }
}))

export default Tab
