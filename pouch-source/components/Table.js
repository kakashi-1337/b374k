import { useState, useMemo } from 'react'
import {
  useMantineTheme,
  createStyles,
  Table as MantineTable,
  Box,
  ScrollArea,
  Skeleton,
  Group,
  UnstyledButton,
  Text,
  TextInput,
} from '@mantine/core'
import { useTable, usePagination } from 'react-table'
import { Select } from 'components'
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from '@tabler/icons'

const NavButton = ({ sx, ...rest }) => {
  const theme = useMantineTheme()
  return (
    <UnstyledButton
      {...rest}
      sx={{
        ':active': {
          ...theme.activeStyles,
        },
      }}
    />
  )
}

const Table = ({
  columns,
  data,
  rowsPerPage = 10,
  rowsPerPageList = [10, 20, 30, 40, 50],
  setRowsPerPage,
  totalPages,
  height,
  hiddenColumns = [],
  pageNum,
  setPageNum = () => {},
  loading = false,
  striped = false,
  pagination = true,
}) => {
  const theme = useMantineTheme()
  const { classes, cx } = useStyles()
  const tableData = useMemo(() => {
    return loading ? Array(rowsPerPage).fill({}) : data
  }, [loading, data])
  const tableColumns = useMemo(() => {
    return loading
      ? columns.map((column) => ({
          ...column,
          Cell: <Skeleton my="md" height={10} sx={{ zIndex: 0 }} />,
        }))
      : columns
  }, [loading, columns])
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns: tableColumns,
      data: tableData,
      initialState: { pageSize: rowsPerPage, hiddenColumns },
    },
    usePagination,
  )
  const [scrolled, setScrolled] = useState(false)

  const handleNext = () => {
    const value = pageNum + 1
    setPageNum(value)
    nextPage()
  }

  const handlePrev = () => {
    const value = pageNum - 1
    setPageNum(value)
    previousPage()
  }

  const handleFirst = () => {
    const value = 0
    setPageNum(value)
    gotoPage(value)
  }

  const handleLast = () => {
    const value = totalPages || pageCount - 1
    setPageNum(value)
    gotoPage(value)
  }

  const prevDisabled = totalPages ? pageNum === 1 : !canPreviousPage
  const nextDisabled = totalPages ? pageNum === totalPages : !canNextPage

  const iconColor = theme.other[theme.colorScheme].text

  return (
    <Box>
      <ScrollArea
        type="always"
        sx={{ height }}
        styles={{
          scrollbar: {
            '&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
              zIndex: 999,
            },
          },
        }}
        onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
      >
        <MantineTable highlightOnHover striped={striped} {...getTableProps()}>
          <thead
            className={cx(classes.header, { [classes.scrolled]: scrolled })}
          >
            {headerGroups.map((headerGroup, i) => (
              <tr
                key={`headerGroup-${i}`}
                {...headerGroup.getHeaderGroupProps()}
              >
                {headerGroup.headers.map((column, j) => (
                  <th key={`column-${i}-${j}`} {...column.getHeaderProps()}>
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row, i) => {
              prepareRow(row)
              return (
                <tr key={`row-${i}`} {...row.getRowProps()}>
                  {row.cells.map((cell, j) => {
                    return (
                      <td key={`cell-${i}-${j}`} {...cell.getCellProps()}>
                        {cell.render('Cell')}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </MantineTable>
      </ScrollArea>
      {pagination ? (
        <Group position="right" mt="lg">
          <Text>Go to page</Text>
          <TextInput
            type="number"
            value={pageNum || Number(pageIndex) + 1}
            onChange={(e) => {
              const num = Number(e.target.value) - 1
              gotoPage(num)
              setPageNum(num + 1)
            }}
            sx={{ width: 60 }}
          />
          <Text>Rows per page</Text>
          <Select
            data={rowsPerPageList.map((num) => ({ value: num, label: num }))}
            value={pageSize}
            onChange={(value) => {
              setPageSize(Number(value))
              setRowsPerPage(Number(value))
            }}
            sx={{ width: 70 }}
          />
          <Text>
            Page {pageNum || pageIndex + 1} of{' '}
            {totalPages || pageOptions.length}
          </Text>
          <NavButton onClick={handleFirst} disabled={prevDisabled}>
            <IconChevronsLeft color={iconColor} />
          </NavButton>
          <NavButton onClick={handlePrev} disabled={prevDisabled}>
            <IconChevronLeft color={iconColor} />
          </NavButton>
          <NavButton onClick={handleNext} disabled={nextDisabled}>
            <IconChevronRight color={iconColor} />
          </NavButton>
          <NavButton onClick={handleLast} disabled={nextDisabled}>
            <IconChevronsRight color={iconColor} />
          </NavButton>
        </Group>
      ) : null}
    </Box>
  )
}

export default Table

const useStyles = createStyles((theme) => ({
  header: {
    position: 'sticky',
    top: 0,
    backgroundColor: theme.other[theme.colorScheme].cardBgColor,
    transition: 'box-shadow 150ms ease',
    zIndex: 1,
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      borderBottom: `1px solid ${
        theme.colorScheme === 'dark'
          ? theme.colors.dark[3]
          : theme.colors.gray[2]
      }`,
    },
  },
  scrolled: {
    boxShadow: theme.shadows.sm,
  },
}))
