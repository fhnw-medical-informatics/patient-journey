import { DataState } from '../dataSlice'
import { Typography } from '@mui/material'
import { LoadingError } from './LoadingError'
import { LoadingProgress } from './LoadingProgress'
import { DataView } from './DataView'

export interface Props {
  readonly data: DataState
}

export const Data = ({ data }: Props) => {
  switch (data.type) {
    case 'loading-pending':
      return <Typography>No Data</Typography>
    case 'loading-in-progress':
      return <LoadingProgress />
    case 'loading-failed':
      return <LoadingError errorMessage={data.errorMessage} />
    case 'loading-complete': {
      return <DataView />
    }
  }
}
