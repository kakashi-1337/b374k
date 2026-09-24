import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import {
  useMantineTheme,
  TextInput,
  Grid,
  Center,
  Text,
  Box,
} from '@mantine/core'
import { Card, Button } from 'components'

const LayoutInput = (props) => (
  <TextInput my='sm' size='lg' type='text' {...props} />
)

const Layouts = ({ username, showCustomInput }) => {
  const theme = useMantineTheme();
  const history = useHistory();
  // Single
  const [single, setSingle] = useState(username || '')
  // Multiple (4)
  const [multiple4, setMultiple4] = useState(new Array(4).fill(username || ''))
  // Multiple (8)
  const [multiple8, setMultiple8] = useState(new Array(8).fill(username || ''))
  const backgroundColor = theme.other[theme.colorScheme].outline

  useEffect(() => {
    setSingle(username)
    setMultiple4(new Array(4).fill(username))
    setMultiple8(new Array(8).fill(username))
  }, [username])

  const handleMultiple4 = (value, index) => {
    const newMultiple4 = [...multiple4];
    newMultiple4[index] = value;
    setMultiple4(newMultiple4);
  };

  const handleMultiple8 = (value, index) => {
    const newMultiple8 = [...multiple8];
    newMultiple8[index] = value;
    setMultiple8(newMultiple8);
  };

  const handleSingleViewPDF = () => {
    history.push(`/print-qr?usernames=${single}`)
  }

  const handleMultiple4ViewPDF = () => {
    const usernames = multiple4.join(',')
    history.push(`/print-qr?usernames=${usernames}`)
  }

  const handleMultiple8ViewPDF = () => {
    const usernames = multiple8.join(',')
    history.push(`/print-qr?usernames=${usernames}`)
  }

  return (
    <Grid gutter="xl">
      <Grid.Col xs={12} sm={3}>
        <Card mb='md' p='md' sx={{ height: 300 }}>
          <Center mb='md'>
            <Box sx={{ width: 160, height: 220, backgroundColor }} />
          </Center>
          <Text p='xs' weight={600} align='center'>Single</Text>
        </Card>
        {showCustomInput
          ? <LayoutInput
            value={single}
            placeholder='Input username'
            onChange={e => setSingle(e.target.value)}
          />
          : null}
        <Button
          fullWidth
          onClick={handleSingleViewPDF}
          disabled={!single}
        >
          View PDF
        </Button>
      </Grid.Col>
      <Grid.Col xs={12} sm={3}>
        <Card mb='md' p='md' sx={{ height: 300 }}>
          <Center>
            <Box mb='md' sx={{ width: 160, height: 220 }}>
              <Grid>
                {new Array(4).fill(null).map((_, i) => (
                  <Grid.Col key={i} span={6}>
                    <Box sx={{ width: 75, height: 100, backgroundColor }} />
                  </Grid.Col>
                ))}
              </Grid>
            </Box>
          </Center>
          <Text p='xs' weight={600} align='center'>Multiple (4)</Text>
        </Card>
        {showCustomInput
          ? multiple4.map((_, i) => (
            <LayoutInput
              key={i}
              value={multiple4[i]}
              placeholder={`Input username ${i + 1}`}
              onChange={e => handleMultiple4(e.target.value, i)}
            />
          ))
          : null}
        <Button
          fullWidth
          onClick={handleMultiple4ViewPDF}
          disabled={multiple4.some(el => el.length === 0)}
        >
          View PDF
        </Button>
      </Grid.Col>
      <Grid.Col xs={12} sm={3}>
        <Card mb='md' p='md' sx={{ height: 300 }}>
          <Center mb='md'>
            <Box sx={{ width: 160, height: 220 }}>
              <Grid>
                {new Array(8).fill(null).map((_, i) => (
                  <Grid.Col key={i} span={3}>
                    <Box sx={{ width: 35, height: 60, backgroundColor }} />
                  </Grid.Col>
                ))}
              </Grid>
            </Box>
          </Center>
          <Text p='xs' weight={600} align='center'>Multiple (8)</Text>
        </Card>
        {showCustomInput
          ? multiple8.map((_, i) => (
            <LayoutInput
              key={i}
              value={multiple8[i]}
              placeholder={`Input username ${i + 1}`}
              onChange={e => handleMultiple8(e.target.value, i)}
            />
          ))
          : null}
        <Button
          fullWidth
          onClick={handleMultiple8ViewPDF}
          disabled={multiple8.some(el => el.length === 0)}
        >
          View PDF
        </Button>
      </Grid.Col>
    </Grid>
  )
}

export default Layouts
