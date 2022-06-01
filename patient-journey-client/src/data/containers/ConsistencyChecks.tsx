import { ConsistencyChecks as ConsistencyChecksComponent } from '../components/ConsistencyChecks'
import { useAppDispatch } from '../../store'
import { useCallback, useEffect } from 'react'
import { loadingDataComplete, loadingDataFailed } from '../dataSlice'
import { DATA_LOADING_ERROR, DATA_LOADING_WARNING, LoadedData } from '../loading'
import CheckDataConsistencyWorker from '../workers/createCheckDataConsistency?worker'
import { CheckDataConsistencyWorkerResponse } from '../workers/createCheckDataConsistency'
import { ConsistencyCheckData } from '../checkDataConsistency'
import { useWorker } from '../workers/hooks'
import { addAlerts, Alert } from '../../alert/alertSlice'

const CHECKS_SKIPPED_ALERT: Alert = {
  type: 'warning',
  topic: DATA_LOADING_WARNING,
  message: 'Data consistency checks skipped on request',
}

interface Props {
  data: LoadedData
}

export const ConsistencyChecks = ({ data }: Props) => {
  const response = useWorker<ConsistencyCheckData, CheckDataConsistencyWorkerResponse>(
    CheckDataConsistencyWorker,
    data,
    {
      type: 'idle',
    }
  )

  const dispatch = useAppDispatch()
  useEffect(() => {
    console.log({ response })
    switch (response.type) {
      case 'success':
        dispatch(loadingDataComplete(data))
        dispatch(
          addAlerts(response.warnings.map((message) => ({ type: 'warning', topic: DATA_LOADING_WARNING, message })))
        )
        return
      case 'error':
        dispatch(loadingDataFailed(DATA_LOADING_ERROR))
        dispatch(addAlerts([{ type: 'error', topic: DATA_LOADING_ERROR, message: response.message }]))
        return
      default:
        return
    }
  }, [response, dispatch, data])

  const onSkipPressed = useCallback(() => {
    dispatch(loadingDataComplete(data))
    dispatch(addAlerts([CHECKS_SKIPPED_ALERT]))
  }, [dispatch, data])

  return <ConsistencyChecksComponent onSkipPressed={onSkipPressed} />
}
