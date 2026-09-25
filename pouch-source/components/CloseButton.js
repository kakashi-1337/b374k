import { useMantineTheme, ActionIcon } from "@mantine/core";
import { IconX } from '@tabler/icons'

const CloseButton = ({ ...rest }) => {
  const theme = useMantineTheme();
  return (
    <ActionIcon variant="transparent" {...rest}>
      <IconX color={theme.other[theme.colorScheme].text} />
    </ActionIcon>
  )
}

export default CloseButton