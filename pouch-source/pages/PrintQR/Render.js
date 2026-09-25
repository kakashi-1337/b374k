import { QRCode } from 'react-qrcode-logo';
import { Image } from '@mantine/core'
import lightningIcon from 'assets/images/lightning-icon.png'

const Render = ({ captureRef, pageStyle, encodedString, username, imageSrc, imageWidth, imageHeight, spName }) => {
    const qrSize = imageWidth * .55
    const qrOffset = imageHeight * (spName ? .5 : .45)
    const iconSize = 30
    const nameFontSize = 42 - (spName?.length * 0.6)
    const usernameFontSize = 24 - (username.length * 0.6)
    const primaryColor = '#2A2A2A'

    return (
            <div ref={captureRef} style={pageStyle}>
              <div style={{ position: 'relative', top: qrOffset, zIndex: -1 }}>
                <QRCode
                  value={encodedString}
                  size={qrSize}
                  qrStyle='dots'
                  ecLevel='M'
                  bgColor='transparent'
                  eyeRadius={[
                    [10, 10, 0, 10], // top/left eye
                    [10, 10, 10, 0], // top/right eye
                    [10, 0, 10, 10], // bottom/left
                  ]}
                />
                <Image 
                  width={iconSize}
                  style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} 
                  src={lightningIcon} 
                  />
              </div>
              <div style={{ textAlign: 'center', fontFamily: 'Poppins', fontSize: `${usernameFontSize}px`, color: primaryColor, width: imageWidth * .9, position: 'absolute', top: qrOffset - 135, fontWeight: 'bold' }}>
                <div style={{ height: '90px', fontSize: nameFontSize }}>{spName}</div>
                <div style={{ fontSize: '9px', textTransform: 'uppercase'}}>LIGHTNING ADDRESS:</div>
                {username}@pouch.ph
              </div>
              <div style={{ textAlign: 'center', fontFamily: 'Montserrat', fontSize: '14px', color: primaryColor, width: imageWidth * .9, position: 'absolute', bottom: imageWidth * .05 }}>
                Having trouble with the QR code? Try going to <b>pouch.ph/{username}</b> in a browser!
              </div>
              <Image
                src={imageSrc}
                width={imageWidth}
                style={{
                  position: 'absolute',
                  zIndex: -1,
                  bottom: 0,
                }}
              />
            </div>
    )
}

export default Render
