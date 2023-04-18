import React from 'react'

import { DataState } from '../dataSlice'
import { MdsView } from '../../mds/containers/MdsView'

export interface Props {
  readonly type: DataState['type']
  readonly errorMessage: string
  readonly children: JSX.Element
}

export const Data = ({ type, errorMessage = '', children }: Props) => {
  return <MdsView />
}
