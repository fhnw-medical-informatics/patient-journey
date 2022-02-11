import { TablePagination } from '@mui/material'
import React from 'react'
import { makeStyles } from '../../../utils'

export const FOOTER_HEIGHT = 40

const useStyles = makeStyles()({
  toolbar: {
    minHeight: FOOTER_HEIGHT,
    height: FOOTER_HEIGHT,
  },
})

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
      component={({ children }) => children}
      count={count}
      rowsPerPageOptions={[]}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={onPageChange}
      classes={{ toolbar: classes.toolbar }}
    />
  )
}
