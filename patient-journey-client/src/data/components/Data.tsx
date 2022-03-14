import { DataState } from '../dataSlice'
import { Paper, Typography } from '@mui/material'
import { LoadingError } from './LoadingError'
import { LoadingProgress } from './LoadingProgress'
import { makeStyles } from '../../utils'
import { DataTable } from '../containers/table/DataTable'

const useStyles = makeStyles()({
  root: {
    display: 'grid',
    width: '100%',
    height: '100%',
    placeItems: 'center',
  },
})

export interface Props {
  readonly data: DataState
}

export const Data = ({ data }: Props) => {
  const { classes } = useStyles()
  return (
    <Paper className={classes.root}>
      <DataView data={data} />
    </Paper>
  )
}

const DataView = ({ data }: Props) => {
  switch (data.type) {
    case 'loading-pending':
      return <Typography>No Data</Typography>
    case 'loading-in-progress':
      return <LoadingProgress />
    case 'loading-failed':
      return <LoadingError errorMessage={data.errorMessage} />
    case 'loading-complete': {
      return <DataTable />
    }
  }
}
