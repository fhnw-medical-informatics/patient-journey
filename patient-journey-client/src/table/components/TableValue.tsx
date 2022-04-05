import React, { useMemo } from 'react'
import { TableCell } from '@mui/material'
import { makeStyles } from '../../utils'
import { DataColumn, formatMillis, stringToBoolean } from '../../data/columns'
import { Check } from '@mui/icons-material'

const useStyles = makeStyles()((theme) => ({
  tableCell: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    padding: theme.spacing(0.5),
  },
  checkIcon: {
    fontSize: 'small',
  },
}))

interface Props {
  readonly column: DataColumn<string>
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
      case 'boolean':
        return stringToBoolean(value) ? <Check className={classes.checkIcon} /> : <br />
      case 'timestamp':
        return formatMillis(+value)
      default:
        return value
    }
  }, [value, column.type, classes.checkIcon])

  return (
    <TableCell key={column.index} className={classes.tableCell} style={{ maxWidth: width }}>
      {displayValue}
    </TableCell>
  )
}
