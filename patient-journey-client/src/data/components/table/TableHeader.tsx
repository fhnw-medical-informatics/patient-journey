import React from 'react'
import { TableHead, TableRow } from '@mui/material'
import { Sorting, TableHeaderCell } from './TableHeaderCell'
import { PatientDataColumn } from '../../patients'
import { EventDataColumn } from '../../events'

interface Props extends Sorting {
  readonly columns: ReadonlyArray<PatientDataColumn> | ReadonlyArray<EventDataColumn>
  readonly columnWidth: number
}

export const TableHeader = (props: Props) => {
  const { columns } = props
  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableHeaderCell
            key={column.index}
            column={column}
            {...props}
            suppressDivider={column.index === columns.length - 1}
          />
        ))}
      </TableRow>
    </TableHead>
  )
}
