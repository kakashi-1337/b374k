import React from 'react'
import axios from 'axios'
import { useHistory } from 'react-router-dom'
import {
  useMantineTheme,
  useMantineColorScheme,
  Text,
  Box,
  Group,
  Drawer,
  Anchor,
  Divider,
  Switch,
  UnstyledButton,
  Avatar
} from '@mantine/core'
import {
  Setting2,
  MessageQuestion,
  InfoCircle,
  Global,
  Moon,
  Code,
  LogoutCurve
} from 'iconsax-react'
import { IconChevronRight } from '@tabler/icons'
import ListItem from '../ListItem'
import CloseButton from '../CloseButton'
import { useUserContext } from 'hooks'

const UserMenuFooter = (props) => {
  const theme = useMantineTheme()

  const items = [
    { name: 'Privacy', to: '#' },
    { name: '·' },
    { name: 'Terms', to: '#' },
    { name: '·' },
    { name: 'Cookies', to: '#' },
    { name: '·' },
    { name: 'Pouch.ph © 2022' }
  ]

  return (
    <Group position="center" spacing="xs" {...props}>
      {items.map((item, i) =>
        item.to ? (
          <Anchor
            key={i}
            size="sm"
            href={item.to}
            target="_blank"
            sx={{ color: theme.other[theme.colorScheme].secondary }}
          >
            {item.name}
          </Anchor>
        ) : (
          <Text
            key={i}
            size="sm"
            sx={{ color: theme.other[theme.colorScheme].secondary }}
          >
            {item.name}
          </Text>
        )
      )}
    </Group>
  )
}

const UserMenuProfile = ({ onClose }) => {
  const { user, profilePicture, profilePictureLoading } = useUserContext()
  const theme = useMantineTheme()
  const history = useHistory()

  const handleClick = () => {
    onClose()
    history.push('/dashboard/account')
  }

  return (
    <UnstyledButton
      onClick={handleClick}
      sx={{
        width: '100%',
        ':active': {
          opacity: 0.6,
          ...theme.activeStyles
        }
      }}
    >
      <Group
        mb="lg"
        p="lg"
        sx={{
          background: theme.other[theme.colorScheme].cardBgColor,
          boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.1)',
          borderRadius: theme.radius.sm,
          ':hover': {
            backgroundColor: theme.other[theme.colorScheme].lightBgColor
          }
        }}
      >
        {profilePictureLoading ? (
          <Box
            style={{
              width: 30,
              height: 30,
              backgroundColor: theme.other[theme.colorScheme].backgroundColor,
              borderRadius: theme.radius.max
            }}
          />
        ) : (
          <Avatar radius="max" src={profilePicture} size={30} />
        )}
        <Box>
          <Text size="xl" weight={700}>
            {user?.name}
          </Text>
          <Group spacing={0}>
            <Text>{user?.username}</Text>
            <Text sx={{ color: theme.colors.brand[6] }}>@pouch.ph</Text>
          </Group>
        </Box>
      </Group>
    </UnstyledButton>
  )
}

const UserMenuDrawer = ({ user, setUser, opened, onClose }) => {
  const theme = useMantineTheme()
  const history = useHistory()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  const handleSignout = () => {
    axios.delete('/api/v0/auth').then(() => {
      setUser(null)
      history.replace('/signin')
    })
  }

  const iconColor = theme.other[theme.colorScheme].text

  const handleColorScheme = () => toggleColorScheme()

  // const items = [
  //   {
  //     icon: <Setting2 color={iconColor} />,
  //     name: 'Advanced Settings',
  //     disabled: true
  //   },
  //   {
  //     icon: <MessageQuestion color={iconColor} />,
  //     name: 'Help & Support',
  //     disabled: true
  //   },
  //   {
  //     icon: <InfoCircle color={iconColor} />,
  //     name: 'Information',
  //     disabled: true
  //   },
  //   { icon: <Global color={iconColor} />, name: 'Language', disabled: true },
  //   {
  //     icon: <Moon color={iconColor} />,
  //     name: 'Dark Mode',
  //     rightComponent: (
  //       <Switch
  //         size="md"
  //         checked={colorScheme === 'dark'}
  //         onClick={handleColorScheme}
  //       />
  //     )
  //   },
  //   { icon: <Code color={iconColor} />, name: 'Developers', disabled: true }
  // ]

  const items = [
    {
      icon: <Moon color={iconColor} />,
      name: 'Dark Mode',
      rightComponent: (
        <Switch
          size="md"
          checked={colorScheme === 'dark'}
          onClick={handleColorScheme}
        />
      )
    }
  ]

  return (
    <Drawer
      position="right"
      opened={opened}
      onClose={onClose}
      size={440}
      withCloseButton={false}
    >
      <Box mx={25} my={40}>
        <Group position="apart">
          <Text id="drawer-title" weight={700} size="xl">
            Preferences & Settings
          </Text>
          <CloseButton onClick={onClose} />
        </Group>
      </Box>
      <Box px="lg">
        <UserMenuProfile user={user} onClose={onClose} />
      </Box>
      <Box>
        {items.map((item, i) => (
          <ListItem
            key={i}
            mx="md"
            my="xs"
            icon={item.icon}
            name={item.name}
            rightComponent={
              item.rightComponent || (
                <IconChevronRight color={theme.other[theme.colorScheme].text} />
              )
            }
            onClick={item.onClick}
            disabled={item.disabled}
          />
        ))}
        <Divider m="md" />
        <ListItem
          mx="md"
          my="xs"
          icon={
            <LogoutCurve
              color={theme.other[theme.colorScheme].error}
              style={{ transform: 'rotate(180deg)' }}
            />
          }
          name="Sign Out"
          color={theme.other[theme.colorScheme].error}
          onClick={handleSignout}
        />
      </Box>
      <UserMenuFooter mt="xl" />
    </Drawer>
  )
}

export default UserMenuDrawer
