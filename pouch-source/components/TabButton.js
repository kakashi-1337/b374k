
import { useMantineTheme, Button } from '@mantine/core'

const TabButton = ({ active, icon, children, ...otherProps }) => {
  const theme = useMantineTheme()

  return (
    <Button
      variant={active ? 'outline' : 'subtle'}
      color={active ? 'brand' : 'gray'}
      leftIcon={icon && icon.type({ stroke: 1.5 })}
      sx={{
        fontWeight: active ? 500 : 400,
        backgroundColor: active
          ? theme.other[theme.colorScheme].lightBgColor
          : theme.other[theme.colorScheme].backgroundColor
      }}
      {...otherProps}
    >
      {children}
    </Button>
  )
}

export default TabButton
