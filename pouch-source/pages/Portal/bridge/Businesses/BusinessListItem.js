import AutomaticWithdrawals from 'pages/Portal/Dashboard/Account/BusinessSettings/AutomaticWithdrawals'
import MerchantCashback from 'pages/Portal/Dashboard/Account/BusinessSettings/MerchantCashback'

const { Accordion } = require('@mantine/core')

const BusinessListItem = ({ business }) => {
  return (
    <Accordion.Item value={business.username}>
      <Accordion.Control>{business.username}</Accordion.Control>
      <Accordion.Panel>
        <AutomaticWithdrawals user={business} isBridgeUser={true} />
        <MerchantCashback user={business} isBridgeUser={true} />
      </Accordion.Panel>
    </Accordion.Item>
  )
}

export default BusinessListItem
