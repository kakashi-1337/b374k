import { Button } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons'

const BackButton = (props) => {
  return (
    <Button
      variant='subtle'
      color='gray'
      leftIcon={<IconArrowLeft />}
      {...props}
    >
      Back
    </Button>
  )
}

export default BackButton
