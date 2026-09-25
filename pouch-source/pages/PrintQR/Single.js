
import React, { useState, useEffect, useRef } from 'react'
import {
  PDFViewer,
  Document,
  Page,
  Image as PDFImage,
} from '@react-pdf/renderer'
import { useViewportSize } from '@mantine/hooks'
import html2canvas from 'html2canvas'
import axios from 'axios'
import Render from './Render'
import ErrorDialog from './ErrorDialog'
import { bech32Encode } from '../../helpers/bech32-encode'

const LETTER = {
  width: 612,
  height: 791
}

const Single = ({ username, imageSrc, spName }) => {
  const { height, width } = useViewportSize()
  const [opened, setOpened] = useState(false)
  const [dataUrl, setDataUrl] = useState(null)
  const [invalidUsername, setInvalidUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const captureRef = useRef(null)

  useEffect(() => {
    if (invalidUsername.length) {
      setOpened(true)
    }
  }, [invalidUsername])

  useEffect(() => {
    if (captureRef.current) {
      generateImage(captureRef.current)
    }
  }, [captureRef.current])

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
      try {
        const u = username.toLowerCase()
        const res = await axios.get(`/api/v0/user?username=${u}`)
        if (!res.data.user) {
          setInvalidUsername(username)
        }
      } catch (err) {
        window.location.href = '/print-qr'
      }
      setLoading(false)
    } catch (err) {
      window.location.href = '/print-qr'
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  if (loading) return <div>Loading please wait...</div>

  // Render PDF Viewer
  if (dataUrl) {
    return (
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '90vh'
        }}
      >
        <img
          src={dataUrl}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
        />
      </div>
    )
  }

  const pageStyle = {
    width: LETTER.width,
    height: LETTER.height,
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'column',
    position: 'relative'
  }

  const imageHeight = 712
  const imageWidth = 440

  const encodedString = `https://app.pouch.ph/${username}` + "?lightning=" + bech32Encode(`https://app.pouch.ph/.well-known/lnurlp/${username}`)

  // Generates image
  return (
    <Render
      captureRef={captureRef}
      pageStyle={pageStyle}
      encodedString={encodedString}
      username={username}
      imageSrc={imageSrc}
      imageHeight={imageHeight}
      imageWidth={imageWidth}
      spName={spName}
    />
  )
}

export default Single
