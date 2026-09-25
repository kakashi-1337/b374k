import React from 'react'
import {
  useMantineTheme,
  Group,
  Text,
  Avatar,
  UnstyledButton,
  ThemeIcon,
  Box
} from '@mantine/core'
import { IconChevronDown } from '@tabler/icons'
import { useUserContext } from 'hooks'

const UserMenu = ({ onClick }) => {
  const { user, profilePicture, profilePictureLoading } = useUserContext()
  const theme = useMantineTheme()
  return (
    <UnstyledButton onClick={onClick}>
      <Group>
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
        <Text size="lg" weight={700}>
          {user?.username}
        </Text>
        <ThemeIcon color="transparent">
          <IconChevronDown />
        </ThemeIcon>
      </Group>
    </UnstyledButton>
  )
}

export default UserMenu
