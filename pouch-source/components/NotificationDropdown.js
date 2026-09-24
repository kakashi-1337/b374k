import { ActionIcon, createStyles } from '@mantine/core'
import { Notification } from 'iconsax-react'

const NotificationDropdown = () => {
  const { classes } = useStyles()
  return (
    <ActionIcon className={classes.icon} variant="transparent">
      <Notification />
    </ActionIcon>
  )
}

export default NotificationDropdown

const useStyles = createStyles((theme) => ({
  icon: {
    color: theme.other[theme.colorScheme].text
  }
}))
