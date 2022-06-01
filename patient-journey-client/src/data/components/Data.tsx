import React from 'react'

import { DataState } from '../dataSlice'
import { Typography } from '@mui/material'
import { LoadingError } from './LoadingError'
import { LoadingProgress } from '../containers/LoadingProgress'

export interface Props {
  readonly type: DataState['type']
  readonly errorMessage: string
  readonly children: JSX.Element
}

export const Data = ({ type, errorMessage = '', children }: Props) => {
  switch (type) {
    case 'loading-pending':
      return <Typography>No Data</Typography>
    case 'loading-in-progress':
      return <LoadingProgress />
    case 'loading-failed':
      return <LoadingError errorMessage={errorMessage} />
    case 'loading-complete': {
      return children
    }
  }
}
