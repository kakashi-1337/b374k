import React from 'react'
import { Group, Avatar, UnstyledButton, ThemeIcon } from '@mantine/core'
import { IconChevronDown } from '@tabler/icons'
import { useUserContext } from 'hooks'

const UserMenuSmall = ({ onClick }) => {
  const { profilePicture } = useUserContext()
  return (
    <UnstyledButton onClick={onClick}>
      <Group spacing="xs">
        <Avatar radius="max" src={profilePicture} size={30} />
        <ThemeIcon color="transparent">
          <IconChevronDown />
        </ThemeIcon>
      </Group>
    </UnstyledButton>
  )
}

export default UserMenuSmall
