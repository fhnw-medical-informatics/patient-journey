import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableRow } from '@mui/material'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'
import { makeStyles } from '../../../utils'
import { Patient, PatientId } from '../../dataSlice'
import { NoMatchesPlaceholder } from './NoMatchesPlaceholder'
import { ColumnSortingState } from './TableHeaderCell'
import { TableHeader } from './TableHeader'
import { FOOTER_HEIGHT, TableFooter } from './TableFooter'

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
  readonly columns: ReadonlyArray<string>
  readonly patients: ReadonlyArray<Patient>
  readonly selectedPatient: PatientId
  readonly onPatientClick: (id: PatientId) => void
}

export const PatientDataTable = (props: Props) => {
  const { classes } = useStyles()
  const { columns, patients, selectedPatient, onPatientClick } = props

  const [sortingState, setSortingState] = useState<ColumnSortingState>({ type: 'neutral' })
  const [page, setPage] = useState<number>(0)

  useEffect(() => setPage(0), [patients.length])

  return (
    <div className={classes.maxed}>
      <AutoSizer>
        {({ width, height }: Size) => {
          const columnWidth = width / columns.length
          const bodyHeight = height - HEADER_HEIGHT - FOOTER_HEIGHT
          const rowsPerPage = Math.floor(bodyHeight / ROW_HEIGHT)
          const emptyRowCount = rowsPerPage - Math.min(rowsPerPage, patients.length - page * rowsPerPage)
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
                  {stableSort(patients, sortingState)
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow
                        key={row.id}
                        hover={true}
                        selected={selectedPatient === row.id}
                        onClick={() => onPatientClick(row.id)}
                      >
                        {columns.map((_, index) => {
                          const value = row.values[index] ?? ''
                          return (
                            <TableCell
                              key={`${row.id}/${index}`}
                              className={classes.tableCell}
                              style={{ maxWidth: columnWidth }}
                            >
                              {value === '' ? <br /> : value}
                            </TableCell>
                          )
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
                count={patients.length}
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

// Sorting logic inspired by https://codesandbox.io/s/f71wj?file=/demo.js
// In addition to 'asc' | 'desc', we support a 3rd 'neutral' state (import order)

function stableSort(rows: ReadonlyArray<Patient>, sortingState: ColumnSortingState) {
  if (sortingState.type === 'neutral') {
    return rows
  } else {
    const stabilizedThis = rows.map<[Patient, number]>((rowData, index) => [rowData, index])
    stabilizedThis.sort((a, b) => {
      const comparator = getComparator(sortingState.type, sortingState.columnIndex)
      const order = comparator(a[0], b[0])
      if (order !== 0) return order
      return a[1] - b[1]
    })
    return stabilizedThis.map((e) => e[0])
  }
}

function getComparator(order: 'asc' | 'desc', orderByColumnIndex: number) {
  return (a: Patient, b: Patient) => (order === 'desc' ? 1 : -1) * compare(a, b, orderByColumnIndex)
}

function compare(a: Patient, b: Patient, orderByColumnIndex: number) {
  return b.values[orderByColumnIndex].localeCompare(a.values[orderByColumnIndex])
}
