import { DataState, PatientIdNone } from '../dataSlice'
import { Paper, Typography } from '@mui/material'
import { LoadingError } from './LoadingError'
import { LoadingProgress } from './LoadingProgress'
import { makeStyles } from '../../utils'
import { PatientDataTable } from './table/PatientDataTable'

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

  const View = () => {
    switch (data.type) {
      case 'loading-pending':
        return <Typography>No Data</Typography>
      case 'loading-in-progress':
        return <LoadingProgress />
      case 'loading-failed':
        return <LoadingError errorMessage={data.errorMessage} />
      case 'loading-complete': {
        return (
          <PatientDataTable
            columns={data.patientData.fields}
            patients={data.patientData.rows}
            selectedPatientId={PatientIdNone}
            onSelectPatient={() => {}}
          />
        )
      }
    }
  }

  return (
    <Paper className={classes.root}>
      <View />
    </Paper>
  )
}
