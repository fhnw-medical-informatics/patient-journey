import { Data as DataComponent } from '../components/Data'
import { useDataLoadingErrorMessage, useDataLoadingState } from '../hooks'
import { DataView } from '../components/DataView'

export const Data = () => {
  const type = useDataLoadingState()
  const errorMessage = useDataLoadingErrorMessage()

  return (
    <DataComponent type={type} errorMessage={errorMessage}>
      <DataView />
    </DataComponent>
  )
}
