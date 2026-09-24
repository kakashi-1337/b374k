import { createStyles, Group, Box, Text, UnstyledButton, ThemeIcon } from '@mantine/core'
import { IconChevronDown } from '@tabler/icons'

const UserDropdownMenu = ({ user }) => {
  const { classes } = useStyles()
  let accountType = 'Personal'
  if (user.businessMetadata.isBusiness) accountType = 'Business'
  if (user.businessMetadata.isRemittancePartner) accountType = 'Partner'
  if (user.businessMetadata.isRemittancePartnerAgent) accountType = 'Agent'

  const handleClick = () => {

  }

  return (
    <>
      <UnstyledButton className={classes.button} onClick={handleClick}>
        <Group spacing='xs' sx={{ margin: 10 }}>
          <Box className={classes.avatar}></Box>
          <Box>
            <Text size='lg' weight='bold' sx={{ marginTop: -3 }}>{user?.username}</Text>
            <Text size='sm' sx={{ marginTop: -6 }}>{accountType} account</Text>
          </Box>
          <ThemeIcon color='transparent'>
            <IconChevronDown />
          </ThemeIcon>
        </Group>
      </UnstyledButton>
    </>
  )
}

export default UserDropdownMenu

const useStyles = createStyles((theme) => ({
  button: {
    borderWidth: 1,
    borderStyle: 'double',
    borderColor: 'transparent',
    borderRadius: 10,
    backgroundImage: `linear-gradient(${theme.other[theme.colorScheme].backgroundColor}, ${theme.other[theme.colorScheme].backgroundColor}), ${theme.other.gradient}`,
    backgroundOrigin: 'border-box',
    backgroundClip: 'content-box, border-box'
  },
  avatar: {
    background: theme.other.gradient,
    width: 40,
    height: 40,
    borderRadius: '50%'
  }
}))
