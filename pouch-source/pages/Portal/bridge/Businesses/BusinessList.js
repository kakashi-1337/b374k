const { Flex, Text, Accordion } = require('@mantine/core')
const { default: BusinessListItem } = require('./BusinessListItem')

const BusinessList = ({ businesses }) => {
  if (!businesses.length) {
    return (
      <Flex justify={{ sm: 'center' }}>
        <Text weight={700} pt={10}>
          No Business Available
        </Text>
      </Flex>
    )
  }

  return (
    <Accordion variant="separated">
      {businesses.map((business) => (
        <BusinessListItem key={business.username} business={business} />
      ))}
    </Accordion>
  )
}

export default BusinessList
