import { ActionIcon, useMantineColorScheme, createStyles } from '@mantine/core'
import { IconSun, IconMoon } from '@tabler/icons'

const ColorSchemeToggle = () => {
  const { classes } = useStyles()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  return (
    <ActionIcon
      className={classes.icon}
      variant='transparent'
      radius='xl'
      onClick={() => toggleColorScheme()}
    >
      {colorScheme === 'light' ? <IconMoon /> : <IconSun /> }
    </ActionIcon>
  )
}

export default ColorSchemeToggle

const useStyles = createStyles((theme) => ({
  icon: {
    color: theme.other[theme.colorScheme].text
  }
}))
