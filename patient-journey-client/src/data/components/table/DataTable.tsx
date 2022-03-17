import React, { useEffect, useMemo, useState } from 'react'
import { Table, TableBody, TableCell, TableRow } from '@mui/material'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'
import { makeStyles } from '../../../utils'
import { PatientData, PatientId, PatientIdNone } from '../../patients'
import { NoMatchesPlaceholder } from './NoMatchesPlaceholder'
import { TableHeader } from './TableHeader'
import { FOOTER_HEIGHT, TableFooter } from './TableFooter'
import { ColumnSortingState, stableSort } from '../../sorting'
import { TableValue } from './TableValue'
import { EventData } from '../../events'

const ROW_HEIGHT = 28.85 // MUI 'dense' table with our custom padding
const HEADER_HEIGHT = 48 // MUI header height with our custom padding

const useStyles = makeStyles()((theme) => ({
  maxed: {
    display: 'grid',
    width: '100%',
    minWidth: '100%',
    height: '100%',
    position: 'relative',
  },
  table: {
    // hide final bottom border
    '& tbody tr:last-child th, & tbody tr:last-child td': {
      border: 0,
    },
  },
  tableCell: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    padding: theme.spacing(0.5),
  },
}))

interface Props {
  readonly data: PatientData['allPatients'] | EventData['allEvents']
  readonly columns: PatientData['columns'] | EventData['columns']
  readonly onPatientClick: (id: PatientId) => void
  readonly onPatientHover: (id: PatientId) => void
}

export const DataTable = ({ data, columns, onPatientClick, onPatientHover }: Props) => {
  const { classes } = useStyles()
  const tableData = data
  const [sortingState, setSortingState] = useState<ColumnSortingState>({ type: 'neutral' })
  const [page, setPage] = useState<number>(0)
  // TODO: sortedData should be a selector
  const sortedRows = useMemo(() => stableSort(tableData, sortingState), [tableData, sortingState])

  useEffect(() => setPage(0), [tableData.length])

  return (
    <div className={classes.maxed}>
      <AutoSizer>
        {({ width, height }: Size) => {
          const columnWidth = width / columns.length
          const bodyHeight = height - HEADER_HEIGHT - FOOTER_HEIGHT
          const rowsPerPage = Math.floor(bodyHeight / ROW_HEIGHT)
          const emptyRowCount = rowsPerPage - Math.min(rowsPerPage, tableData.length - page * rowsPerPage)
          const isAllRowsEmpty = emptyRowCount === rowsPerPage

          return (
            <div style={{ width, height }}>
              <Table size="small" className={classes.table} padding={'none'}>
                <TableHeader
                  columns={columns}
                  columnWidth={columnWidth}
                  sortingState={sortingState}
                  setSortingState={setSortingState}
                />
                <TableBody component={'tbody'}>
                  {sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, idx) => (
                    <TableRow
                      key={`pid:${row.pid}-${idx}`}
                      hover={true}
                      //selected={data.selectedPatient === row.pid}
                      onClick={() => onPatientClick(row.pid)}
                      onMouseEnter={() => onPatientHover(row.pid)}
                      onMouseLeave={() => onPatientHover(PatientIdNone)}
                    >
                      {columns.map((column) => {
                        const value = row.values[column.index] ?? ''
                        return <TableValue key={column.index} column={column} value={value} width={columnWidth} />
                      })}
                    </TableRow>
                  ))}
                  <VerticalSpacer
                    isAllRowsEmpty={isAllRowsEmpty}
                    height={isAllRowsEmpty ? bodyHeight : bodyHeight - (rowsPerPage - emptyRowCount) * ROW_HEIGHT}
                  />
                </TableBody>
              </Table>
              <TableFooter
                rowsPerPage={rowsPerPage}
                count={tableData.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
              />
            </div>
          )
        }}
      </AutoSizer>
    </div>
  )
}

interface VerticalSpacerProps {
  readonly isAllRowsEmpty: boolean
  readonly height: number
}

const VerticalSpacer = ({ isAllRowsEmpty, height }: VerticalSpacerProps) => (
  <TableRow>
    <TableCell style={{ textAlign: 'center', height }}>{isAllRowsEmpty ? <NoMatchesPlaceholder /> : ''}</TableCell>
  </TableRow>
)
