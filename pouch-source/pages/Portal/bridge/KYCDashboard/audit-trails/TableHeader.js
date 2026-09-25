import React from 'react'

const headers = ['Message', 'Details', 'Performed by', 'Performed to', 'Date']

const TableHeader = () => {
  return (
    <thead>
      <tr>
        {headers.map((header) => {
          return (
            <th
              key={header}
              style={{
                padding: 20,
                backgroundColor: '#6922FF',
                color: '#fff',
                fontSize: 16
              }}
            >
              {header}
            </th>
          )
        })}
      </tr>
    </thead>
  )
}

export default TableHeader
