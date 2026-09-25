import { useState } from 'react'
import { createStyles, Box, Text } from '@mantine/core'

const TextViewMore = ({ text, maxLength, ...rest }) => {
  const { classes } = useStyles()
  const [expand, setExpand] = useState(false)

  const handleExpand = () => setExpand((val) => !val)

  return (
    <Box className={classes.wrapper} {...rest}>
      <Text
        className={expand ? classes.expandedText : classes.entityIdentifier}
      >
        {expand ? text : text.slice(0, maxLength)}
      </Text>
      {text.length > maxLength ? (
        <Text className={classes.expandButton} size="sm" onClick={handleExpand}>
          View {expand ? 'less' : 'more'}
        </Text>
      ) : null}
    </Box>
  )
}

export default TextViewMore

const useStyles = createStyles((theme) => ({
  wrapper: {
    width: 120
  },
  expandedText: {
    overflowWrap: 'break-word'
  },
  expandButton: {
    color:
      theme.colorScheme === 'light'
        ? theme.colors.brand[6]
        : theme.colors.brand[3],
    cursor: 'pointer'
  },
}))
