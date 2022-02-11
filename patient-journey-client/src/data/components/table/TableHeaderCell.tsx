import { Divider, TableCell, TableSortLabel, Theme } from '@mui/material'
import React from 'react'
import { makeStyles } from '../../../utils'

const useStyles = makeStyles()((theme: Theme) => ({
  cell: {
    padding: theme.spacing(0.5),
  },
  contents: {
    width: '100%',
    height: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
  },
  sortLabel: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    whiteSpace: 'nowrap',
  },
  divider: {
    height: '100%',
    justifySelf: 'end',
    alignSelf: 'center',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}))

export type ColumnSortingState =
  | Readonly<{
      type: 'neutral'
    }>
  | Readonly<{
      type: 'asc' | 'desc'
      columnIndex: number
    }>

export interface Sorting {
  readonly sortingState: ColumnSortingState
  readonly setSortingState: (sortingState: ColumnSortingState) => void
}

export interface Props extends Sorting {
  readonly label: string
  readonly columnIndex: number
  readonly columnWidth: number
  readonly suppressDivider?: boolean
}

export const TableHeaderCell = (props: Props) => {
  const { classes } = useStyles()
  const { columnWidth, label, columnIndex, sortingState, setSortingState, suppressDivider = false } = props

  const changeSortingState = () => {
    if (sortingState.type === 'neutral' || sortingState.columnIndex !== columnIndex) {
      setSortingState({ type: 'asc', columnIndex })
    } else {
      if (sortingState.type === 'asc') {
        setSortingState({ type: 'desc', columnIndex })
      } else {
        setSortingState({ type: 'neutral' })
      }
    }
  }

  const dynamicWidth = {
    width: columnWidth,
    minWidth: columnWidth,
    maxWidth: columnWidth,
  }

  return (
    <TableCell className={classes.cell} style={dynamicWidth} onClick={changeSortingState}>
      <div className={classes.contents}>
        <TableSortLabel
          className={classes.sortLabel}
          active={sortingState.type !== 'neutral' && sortingState.columnIndex === columnIndex}
          direction={
            sortingState.type === 'neutral' || sortingState.columnIndex !== columnIndex ? 'desc' : sortingState.type
          }
        >
          {label}
        </TableSortLabel>
        {suppressDivider || <Divider className={classes.divider} orientation="vertical" />}
      </div>
    </TableCell>
  )
}
