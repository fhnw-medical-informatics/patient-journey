import { Divider, TableCell, TableSortLabel, Theme } from '@mui/material'
import React from 'react'
import { makeStyles } from '../../../utils'
import { ColumnSortingState } from '../../sorting'
import { PatientDataColumn } from '../../patients'
import { EventDataColumn } from '../../events'

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

export interface Sorting {
  readonly sortingState: ColumnSortingState
  readonly setSortingState: (sortingState: ColumnSortingState) => void
}

export interface Props extends Sorting {
  readonly column: PatientDataColumn | EventDataColumn
  readonly columnWidth: number
  readonly suppressDivider?: boolean
}

export const TableHeaderCell = ({
  column,
  columnWidth,
  sortingState,
  setSortingState,
  suppressDivider = false,
}: Props) => {
  const { classes } = useStyles()

  const changeSortingState = () => {
    if (sortingState.type === 'neutral' || sortingState.column.index !== column.index) {
      setSortingState({ type: 'asc', column })
    } else {
      if (sortingState.type === 'asc') {
        setSortingState({ type: 'desc', column })
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
          active={sortingState.type !== 'neutral' && sortingState.column.index === column.index}
          title={sortingTooltip(sortingState)}
          direction={
            sortingState.type === 'neutral' || sortingState.column.index !== column.index ? 'desc' : sortingState.type
          }
        >
          {column.name}
        </TableSortLabel>
        {suppressDivider || <Divider className={classes.divider} orientation="vertical" />}
      </div>
    </TableCell>
  )
}

function sortingTooltip(s: ColumnSortingState) {
  switch (s.type) {
    case 'asc':
      return 'Ascending Order'
    case 'desc':
      return 'Descending Order'
    case 'neutral':
      return 'Click To Sort'
  }
}
