import React from 'react'
import { Data as DataComponent } from '../components/Data'
import { useDataLoadingErrorMessage, useDataLoadingState } from '../hooks'

export const Data = () => {
  const type = useDataLoadingState()
  const errorMessage = useDataLoadingErrorMessage()

  return (
    <DataComponent type={type} errorMessage={errorMessage}>
      <p>Assistant</p>
    </DataComponent>
  )
}
