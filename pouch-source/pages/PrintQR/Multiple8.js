
import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  PDFViewer,
  Document,
  Page,
  Image as PDFImage,
} from '@react-pdf/renderer'
import {
  useMantineTheme,
  Image,
  Text,
  Box,
  Center,
} from '@mantine/core'
import { useViewportSize } from '@mantine/hooks'
import html2canvas from 'html2canvas'
import axios from 'axios'
import { QRCodeSVG } from 'qrcode.react'
import ErrorDialog from './ErrorDialog'

// landscape
const LETTER = {
  width: 791,
  height: 612
}

const INITIAL_FONT_SIZE = 10

const Multiple8 = ({ usernames, imageSrc, textColor }) => {
  const theme = useMantineTheme()
  const { height, width } = useViewportSize()
  const [opened, setOpened] = useState(false)
  const [dataUrl, setDataUrl] = useState(null)
  const [invalidUsernames, setInvalidUsernames] = useState([])
  const [loading, setLoading] = useState(false)
  const [textStyle, setTextStyle] = useState(new Array(8).fill({
    size: INITIAL_FONT_SIZE,
  }))

  const textRefs = useRef(new Array(8).fill(null))
  const initialRef = useRef(true)

  useEffect(() => {
    if (initialRef.current) {
      const newTextStyle = [...textStyle]
      textRefs.current.map((ref, i) => {
        const width = ref.offsetWidth
        if (width > 140) {
          newTextStyle[i] = { size: 7 }
        } else if (width > 120) {
          newTextStyle[i] = { size: 8 }
        } else if (width > 90) {
          newTextStyle[i] = { size: 9 }
        }
      })
      setTextStyle(newTextStyle)
      initialRef.current = false
    }
  }, [textRefs])

  useEffect(() => {
    if (invalidUsernames.length) {
      setOpened(true)
    }
  }, [invalidUsernames])

  const handleCaptureRef = useCallback(async (node) => {
    if (node === null) {
      return
    }
    if (!initialRef.current) {
      generateImage(node)
    }
  }, []);

  const generateImage = async (node) => {
    setLoading(true)
    try {
      const canvas = await html2canvas(node, { scale: 5 })
      const dataUrl = canvas.toDataURL("image/png")
      setDataUrl(dataUrl)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const fetchUser = async () => {
    setLoading(true)
    try {
      const invalidUsernames = []
      await Promise.all(usernames.map(async (username) => {
        try {
          const u = username.toLowerCase()
          const res = await axios.get(`/api/v0/user?username=${u}`)
          if (!res.data.user) {
            invalidUsernames.push(username)
          }
        } catch (err) {
          window.location.href = '/print-qr'
        }
      }))
      setInvalidUsernames(invalidUsernames)
      setLoading(false)
    } catch (err) {
      window.location.href = '/print-qr'
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  if (loading) return <Text>Loading please wait...</Text>

  // Render PDF Viewer
  if (dataUrl) {
    return (
      <>
        <PDFViewer width={width} height={height} style={{ borderWidth: 0 }}>
          <Document>
            <Page size='LETTER' orientation='landscape'>
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
    { top: 15, left: 15 },
    { top: 15, left: 205 },
    { top: 15, left: 390 },
    { top: 15, left: 575 },
    { top: 300, left: 15 },
    { top: 300, left: 205 },
    { top: 300, left: 390 },
    { top: 300, left: 575 },
  ]

  const pageStyle = {
    width: LETTER.width,
    height: LETTER.height,
    position: 'relative',
  }
  const imageWidth = 160
  const spacing = 20

  // Generates image 
  return (
    <div ref={handleCaptureRef} style={pageStyle}>
      <Box sx={{ position: 'relative', top: spacing, left: spacing }}>
        <Box
          sx={{
            width: LETTER.width - spacing * 2,
            height: LETTER.height - spacing * 2,
            backgroundColor: theme.other[theme.colorScheme].primary,
          }}
        >
          {positions.map((pos, i) => (
            <Box key={i} sx={{ width: imageWidth, position: 'absolute', zIndex: 1, ...pos }}>
              <Center>
                <Center pt={87} style={{ height: 5 }}>
                  <Text
                    ref={(el) => textRefs.current[i] = el}
                    weight={500}
                    size={textStyle[i].size - 2}
                    sx={{ color: textColor, display: 'inline-block' }}
                  >
                    pouch.ph/{usernames[i]}
                  </Text>
                </Center>
              </Center>
              <Box pt={27} pl={47}>
                <QRCodeSVG
                  value={`https://pouch.ph/${usernames[i]}`}
                  size={66}
                  bgColor='#F9F9F9'
                  fgColor='#4A4A4A'
                />
              </Box>
              <Center>
                <Center
                  px={5}
                  mt={4}
                  style={{ minWidth: 70, height: 16, backgroundColor: '#F9F9F9', borderRadius: 6 }}
                >
                  <Text
                    ref={(el) => textRefs.current[i] = el}
                    weight={700}
                    size={textStyle[i].size}
                    sx={{ color: '#4A4A4A', display: 'inline-block' }}
                  >
                    {usernames[i]}
                  </Text>
                </Center>
              </Center>
              <Image
                src={imageSrc}
                style={{
                  width: imageWidth,
                  position: 'absolute',
                  zIndex: -1,
                  top: 0
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </div>
  )
}

export default Multiple8
