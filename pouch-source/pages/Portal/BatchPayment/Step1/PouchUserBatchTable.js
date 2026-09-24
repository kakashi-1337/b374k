import { useState, useEffect, useMemo } from 'react'
import { TextInput, Box, Textarea, Group, Text } from '@mantine/core'
import { IconSearch, IconClipboardText } from '@tabler/icons'
import { Button, Table } from 'components'
import commaNumber from 'comma-number'
import roundToPlaces from 'helpers/round-to-places'

const PouchUserBatchTable = ({
  isReadClipboardSupported,
  pouchUserRows,
  setPouchUserRows,
}) => {
  const [pasteData, setPasteData] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (pasteData.length > 0) {
      transformExcelData()
    }
  }, [pasteData])

  const data = useMemo(() => {
    return (
      pouchUserRows.filter((obj) => obj.username.includes(searchQuery)) || []
    )
  }, [pouchUserRows, searchQuery])

  const columns = useMemo(
    () => [
      {
        Header: 'Username',
        accessor: 'username',
      },
      {
        Header: 'Amount',
        accessor: 'amount',
        Cell: ({ value }) => <Text weight={700}>{commaNumber(value)}</Text>,
      },
    ],
    [],
  )

  const handlePaste = async () => {
    if (isReadClipboardSupported) {
      const text = await navigator.clipboard.readText()
      setPasteData(text)
    }
  }

  const handleReset = () => {
    setPasteData('')
    setPouchUserRows([])
  }

  const transformExcelData = async () => {
    const arr = pasteData.split('\n')
    if (arr[arr.length - 1] === '') arr.pop() // removes the last empty element in the array
    const newArr = arr.map((entry) => {
      const strSplit = entry.replace('\r', '').split('\t')
      const parsedAmount = roundToPlaces(
        Number(strSplit[1]?.replace(/[^0-9.]/g, '')),
        2,
      )
      return {
        username: strSplit[0],
        amount: parsedAmount,
      }
    })
    setPouchUserRows(newArr)
  }

  return (
    <>
      <Box mb="xl">
        {isReadClipboardSupported ? null : (
          <Group position="apart">
            <Textarea
              size="md"
              value={pasteData}
              placeholder="Paste rows from spreadsheet here"
              maxRows={1}
              disabled={pasteData.length > 0}
              onChange={(e) => setPasteData(e.target.value)}
            />
            <Button
              variant="subtle"
              onClick={handleReset}
              disabled={pasteData.length === 0}
            >
              Reset
            </Button>
          </Group>
        )}
        <Group position="apart">
          <TextInput
            size="md"
            placeholder="Search Username"
            icon={<IconSearch />}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isReadClipboardSupported ? (
            <Button
              variant="subtle"
              onClick={handlePaste}
              leftIcon={<IconClipboardText />}
            >
              Paste
            </Button>
          ) : null}
        </Group>
      </Box>
      <Table data={data} columns={columns} striped height={500} />
    </>
  )
}

export default PouchUserBatchTable
