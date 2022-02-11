import React from 'react'
import { TableHead, TableRow } from '@mui/material'
import { Sorting, TableHeaderCell } from './TableHeaderCell'

interface Props extends Sorting {
  readonly columns: ReadonlyArray<string>
  readonly columnWidth: number
}

export const TableHeader = (props: Props) => {
  const { columns } = props
  return (
    <TableHead>
      <TableRow>
        {columns.map((column, columnIndex) => (
          <TableHeaderCell
            key={columnIndex}
            label={column}
            columnIndex={columnIndex}
            {...props}
            suppressDivider={columnIndex === columns.length - 1}
          />
        ))}
      </TableRow>
    </TableHead>
  )
}
