import { useState } from 'react'
import { Text, Grid, Switch, createStyles } from '@mantine/core'
import { Card } from 'components'
import { useUserContext } from 'hooks/useUserContext'
import axios from 'axios'

const ListItem = ({ label, children }) => {
  return (
    <>
      <Grid.Col sm={3}>
        <Text weight={600}>{label}</Text>
      </Grid.Col>
      <Grid.Col sm={9}>{children}</Grid.Col>
    </>
  )
}

const MerchantCashback = ({ user, isBridgeUser }) => {
  const { classes } = useStyles()

  const [isParticipating, setIsParticipating] = useState(
    user?.businessMetadata?.merchantCashback || false
  )

  const handleIsParticipating = async (event) => {
    setIsParticipating(event.currentTarget.checked)

    try {
      if (isBridgeUser) {
        await axios.put(
          `/api/v3/bridge/users/${user._id}/config/merchant-cashback`,
          {
            enabled: event.currentTarget.checked
          }
        )
      } else {
        await axios.put('/api/v3/users/config/merchant-cashback', {
          enabled: event.currentTarget.checked
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const renderHeader = () => {
    return (
      <div className={classes.header}>
        <Text size="lg" weight={700}>
          Merchant Cashback
        </Text>
        <Switch checked={isParticipating} onChange={handleIsParticipating} />
      </div>
    )
  }

  return (
    <Card mt="md" title={renderHeader()}>
      {isParticipating && (
        <Text size="md" weight={500}>
          Attract and retain customers by offering 3% instant cash-back as a
          perk for paying with Pouch! If your business opts-in, Pouch will also
          periodically promote your business to a loyal customer base.
        </Text>
      )}
    </Card>
  )
}

const useStyles = createStyles((theme) => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
}))

export default MerchantCashback
