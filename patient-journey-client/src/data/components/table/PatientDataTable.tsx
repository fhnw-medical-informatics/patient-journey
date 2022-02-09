import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableRow } from '@mui/material'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'
import { makeStyles } from '../../../utils'
import { Patient, PatientId, PatientIdNone } from '../../dataSlice'
import { NoMatchesPlaceholder } from './NoMatchesPlaceholder'

// Ideally, we'd like the table header & footer to stick to the end and the table body
// to automagically fill all available space. Unfortunately, it is not possible to place
// an AutoSizer component around the table body (due to DOM validation issues).
// We thus auto-size the complete table and calculate the body size manually...

const ROW_HEIGHT = 33 // MUI default for 'dense' tables

// TODO: Add header & footer

const HEADER_HEIGHT = 0 // 159 // table column header height (only shown in full screen mode)
const FOOTER_HEIGHT = 0 // 52

const useStyles = makeStyles()({
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
  },
})

interface Props {
  readonly fields: ReadonlyArray<string>
  readonly patients: ReadonlyArray<Patient>
  readonly selectedPatientId: PatientId
  readonly onSelectPatient: (id: PatientId) => void
}

export const PatientDataTable = (props: Props) => {
  const { classes } = useStyles()
  const { fields, patients, selectedPatientId, onSelectPatient } = props

  const [sortingState] = useState<ColumnSortingState>({ type: 'neutral' })
  const [page, setPage] = useState<number>(0)

  useEffect(() => setPage(0), [patients.length])

  const onRowClick = (id: PatientId) => () => onSelectPatient(selectedPatientId === id ? PatientIdNone : id)

  return (
    <div className={classes.maxed}>
      <AutoSizer>
        {({ width, height }: Size) => {
          const columnWidth = width / fields.length
          const bodyHeight = height - HEADER_HEIGHT - FOOTER_HEIGHT
          const rowsPerPage = Math.floor(bodyHeight / ROW_HEIGHT)
          const emptyRowCount = rowsPerPage - Math.min(rowsPerPage, patients.length - page * rowsPerPage)
          const isAllRowsEmpty = emptyRowCount === rowsPerPage

          return (
            <div style={{ width, height }}>
              <Table size="small" className={classes.table}>
                <TableBody component={'tbody'}>
                  {stableSort(patients, sortingState)
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow
                        key={row.id}
                        hover={true}
                        selected={selectedPatientId === row.id}
                        onClick={onRowClick(row.id)}
                      >
                        {fields.map((_, index) => {
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
    <TableCell colSpan={6} style={{ textAlign: 'center', height }}>
      {isAllRowsEmpty ? <NoMatchesPlaceholder /> : ''}
    </TableCell>
  </TableRow>
)

// Sorting logic inspired by https://codesandbox.io/s/f71wj?file=/demo.js
// In addition to 'asc' | 'desc', we support a 3rd 'neutral' state (import order)

export type ColumnSortingState =
  | Readonly<{
      type: 'neutral'
    }>
  | Readonly<{
      type: 'asc' | 'desc'
      columnIndex: number
    }>

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
