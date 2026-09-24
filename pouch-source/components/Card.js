import { useState } from 'react'
import { useMantineTheme, Paper, Text, Group, ActionIcon, Modal } from '@mantine/core'
import { useViewportSize } from '@mantine/hooks'
import { IconDotsCircleHorizontal } from '@tabler/icons'

const Card = ({ title, rightComponent, children, sx, ...rest }) => {
  const [opened, setOpened] = useState(false)
  const theme = useMantineTheme()
  const { width } = useViewportSize()

  const renderTitle = title
    ? typeof title === 'string'
      ? <Text size='xl' mb={theme.radius.xl} weight={700}>{title}</Text>
      : title
    : null

  const renderRightComponent = rightComponent
    ? width > theme.breakpoints.sm
      ? rightComponent
      : <ActionIcon onClick={() => setOpened(true)}>
        <IconDotsCircleHorizontal />
      </ActionIcon>
    : null

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title='Options'
      >
        {rightComponent}
      </Modal>
      <Paper
        radius='lg'
        p='lg'
        sx={{
          height: '100%',
          boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.05)',
          ...sx
        }}
        {...rest}
      >
        {rightComponent
          ?
          <Group position="apart">
            {renderTitle}
            {renderRightComponent}
          </Group>
          : renderTitle
        }
        {children}
      </Paper>
    </>
  )
}

export default Card
