import React, { useMemo } from 'react'
import { TableCell } from '@mui/material'
import { PatientDataColumn } from '../../dataSlice'
import { makeStyles } from '../../../utils'
import { formatMillis } from '../../columnTypes'

const useStyles = makeStyles()((theme) => ({
  tableCell: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    padding: theme.spacing(0.5),
  },
}))

interface Props {
  readonly column: PatientDataColumn
  readonly width: number
  readonly value: string
}

export const TableValue = ({ column, value, width }: Props) => {
  const { classes } = useStyles()

  const displayValue = useMemo(() => {
    if (value === null || value.trim().length === 0) {
      return <br />
    }
    switch (column.type) {
      case 'timestamp':
        return formatMillis(+value)
      default:
        return value
    }
  }, [value, column.type])

  return (
    <TableCell key={column.index} className={classes.tableCell} style={{ maxWidth: width }}>
      {displayValue}
    </TableCell>
  )
}
