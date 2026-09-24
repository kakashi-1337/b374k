
import React, { useState } from 'react'
import {
  PDFViewer,
  Document,
  Page,
  Image as PDFImage,
} from '@react-pdf/renderer'
import {
  useMantineTheme,
  Text,
  Box,
} from '@mantine/core'
import { useViewportSize } from '@mantine/hooks'
import ErrorDialog from './ErrorDialog'
import Single from './Single'

const LETTER = {
  width: 612,
  height: 791
}

const Multiple4 = ({ usernames, imageSrc }) => {
  const theme = useMantineTheme()
  const { height, width } = useViewportSize()
  const [opened, setOpened] = useState(false)

  // Render PDF Viewer
  if (dataUrl) {
    return (
      <>
        <PDFViewer width={width} height={height} style={{ borderWidth: 0 }}>
          <Document>
            <Page size='LETTER'>
              <PDFImage src={dataUrl} />
            </Page>
          </Document>
        </PDFViewer>
        <ErrorDialog
          opened={opened}
          onClose={() => setOpened(false)}
          invalidUsernames={invalidUsernames}
        />
      </>
    )
  }

  const positions = [
    { top: 20, left: 20 },
    { top: 20, left: 270 },
    { top: 390, left: 20 },
    { top: 390, left: 270 }
  ]

  const pageStyle = {
    width: LETTER.width,
    height: LETTER.height,
    position: 'relative',
  }
  const imageWidth = 210
  const spacing = 20

  // Generates image 
  return (
    <div ref={handleCaptureRef} style={pageStyle}>
      <Box sx={{ position: 'relative', top: spacing, left: spacing }}>
        <Box
          sx={{
            width: LETTER.width - 110,
            height: LETTER.height - spacing * 2,
            backgroundColor: theme.other[theme.colorScheme].primary,
          }}
        >
          {positions.map((pos, i) => (
            <Box key={i} sx={{ width: imageWidth, position: 'absolute', zIndex: 1, ...pos }}>
              <Single username={usernames[i]} imageSrc={imageSrc} />
            </Box>
          ))}
        </Box>
      </Box>
    </div>
  )
}

export default Multiple4
