import { TablePagination, Typography } from '@mui/material'
import React from 'react'
import { makeStyles } from '../../../utils'
import { useHoveredPatient, useSelectedPatient } from '../../hooks'
import { PatientId, PatientIdNone } from '../../patients'

export const FOOTER_HEIGHT = 40

const useStyles = makeStyles()((theme) => ({
  toolbar: {
    minHeight: FOOTER_HEIGHT,
    height: FOOTER_HEIGHT,
  },
  contents: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    paddingLeft: theme.spacing(1),
  },
}))

interface Props {
  readonly rowsPerPage: number
  readonly count: number
  readonly page: number
  readonly onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void
}

export const TableFooter = ({ rowsPerPage, count, page, onPageChange }: Props) => {
  const { classes } = useStyles()
  return (
    <TablePagination
      component={({ children }) => (
        <div className={classes.contents}>
          <DebugInfo />
          {children}
        </div>
      )}
      count={count}
      rowsPerPageOptions={[]}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={onPageChange}
      classes={{ toolbar: classes.toolbar }}
    />
  )
}

const DebugInfo = () => {
  const selected = useSelectedPatient()
  const hovered = useHoveredPatient()
  const display = (id: PatientId) => (id === PatientIdNone ? '–' : id)
  return (
    <div>
      <Typography fontSize={'small'}>{`Selected: ${display(selected)}`}</Typography>
      <Typography fontSize={'small'}>{`Hovered: ${display(hovered)}`}</Typography>
    </div>
  )
}
