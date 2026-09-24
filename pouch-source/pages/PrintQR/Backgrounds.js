import React from 'react'
import {
  useMantineTheme,
  Grid,
  Image,
  Center,
} from '@mantine/core'
import { Card } from 'components'

const width = 130
const height = 220

const Backgrounds = ({ backgrounds, selectedBackground, setSelectedBackground }) => {
  const theme = useMantineTheme()

  const handleBackgroundChange = (data) => {
    setSelectedBackground(data)
  }

  return (
    <Grid gutter="xl">
      {backgrounds.map((data) => {
        const isSelected = selectedBackground.name === data.name
        return (
          <Grid.Col key={data.name} xs={12} sm={3}>
            <Card
              onClick={() => handleBackgroundChange(data)}
              sx={{
                cursor: 'pointer',
                border: `1px solid ${theme.other[theme.colorScheme][isSelected ? 'primary' : 'cardBgColor']}`,
                backgroundColor: theme.other[theme.colorScheme][isSelected ? 'lightBgColor' : 'cardBgColor']
              }}
            >
              <Center>
                <Image src={data.src} width={width} height={height} />
              </Center>
            </Card>
          </Grid.Col>
        )
      })}
    </Grid>
  )
}

export default Backgrounds
