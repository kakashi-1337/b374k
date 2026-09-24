import {
  createStyles,
  useMantineTheme,
  Group,
  Text,
  UnstyledButton
} from '@mantine/core'
import { IconUserCircle } from '@tabler/icons'

const ListItemButton = ({ name, description, active, ...others }) => {
  const { classes } = useStyles()
  const theme = useMantineTheme()
  return (
    <UnstyledButton
      {...others}
      sx={{
        width: '100%',
        '&:hover': {
          backgroundColor: theme.other[theme.colorScheme].lightBgColor
        }
      }}>
      <Group m='md' position='apart'>
        <Group>
          <IconUserCircle stroke={1.5} className={active && classes.active} />
          <Text weight={active ? 500 : 400} className={active && classes.active}>{name}</Text>
        </Group>
        <Text weight={active ? 500 : 400} className={active && classes.active}>{description}</Text>
      </Group>
    </UnstyledButton>
  )
}
export default ListItemButton

const useStyles = createStyles((theme) => ({
  active: {
    color: theme.colorScheme === 'light' ? theme.colors.brand[6] : theme.colors.brand[2]
  }
}))
