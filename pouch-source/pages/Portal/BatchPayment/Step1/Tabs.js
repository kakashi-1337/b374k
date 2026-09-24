import { Grid, Box } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconUsers, IconBuildingBank } from '@tabler/icons'
import { TabButton } from 'components'

const Tabs = ({ activeTab, setActiveTab }) => {
  const tabBreak = useMediaQuery('(min-width: 460px)')
  return (
    <Box mb="lg">
      <Grid>
        <Grid.Col span={tabBreak ? 6 : 12}>
          <TabButton
            fullWidth
            active={activeTab === 0}
            onClick={() => setActiveTab(0)}
            icon={<IconUsers />}
          >
            Pouch Users
          </TabButton>
        </Grid.Col>
        <Grid.Col span={tabBreak ? 6 : 12}>
          <TabButton
            fullWidth
            active={activeTab === 1}
            onClick={() => setActiveTab(1)}
            icon={<IconBuildingBank />}
          >
            Bank Accounts
          </TabButton>
        </Grid.Col>
      </Grid>
    </Box>
  )
}

export default Tabs
