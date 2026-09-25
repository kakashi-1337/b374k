const {
  ScrollArea,
  Table,
  Text,
  Group,
  Select,
  Flex
} = require('@mantine/core')

const CashbackTransactionTable = ({
  headers,
  rows,
  totalPages = 1,
  page = 1,
  limit = 10,
  onChangePage = () => {},
  onChangeLimit = () => {},
  hasPagination = false
}) => {
  const LIMITS = [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
    { value: 500, label: '500' },
    { value: 1000, label: '1000' }
  ]

  const PAGES = Array.from({ length: totalPages }, (_, index) => {
    const value = index + 1
    return { value, label: String(value) }
  })

  return (
    <>
      <ScrollArea sx={{ height: 300 }} type="always">
        <Table striped verticalSpacing="md">
          <thead>
            <tr>
              {headers.map((header) => {
                return <th key={header}>{header}</th>
              })}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </ScrollArea>
      {hasPagination && (
        <Flex mt={20} justify="right" gap={20}>
          <Group>
            <Text>Go to page</Text>
            <Select value={page} onChange={onChangePage} data={PAGES} />
          </Group>
          <Group>
            <Text>Rows per page</Text>
            <Select value={limit} onChange={onChangeLimit} data={LIMITS} />
          </Group>
        </Flex>
      )}
    </>
  )
}

export default CashbackTransactionTable
