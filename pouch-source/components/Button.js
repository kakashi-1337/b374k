import { useMantineTheme, Button as MantineButton, Text, Stack, UnstyledButton } from '@mantine/core'

// Supports top icon
// Button props and functionality the same as Mantine's
const Button = ({ topIcon, fullWidth = false, children, color, sx, ...rest }) => {
  const theme = useMantineTheme()
  const width = fullWidth ? '100%' : 'initial'
  return topIcon ? (
    <UnstyledButton
      {...rest}
      sx={{
        width,
        height: '100%',
        ':active': {
          opacity: 0.6,
          ...theme.activeStyles
        },
        ...sx
      }}
    >
      <Stack justify="flex-start" align="center">
        {topIcon}
        <Text size="lg" align="center" weight={600} sx={{ wordWrap: 'break-word', color: color || 'inherit' }}>
          {children}
        </Text>
      </Stack>
    </UnstyledButton>
  ) : (
    <MantineButton {...rest} color={color} sx={{ width, ...sx }}>{children}</MantineButton>
  )
}

export default Button
