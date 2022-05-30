import { useDataLoadingProgress } from '../hooks'
import { LoadingProgress as LoadingProgressComponent } from '../components/LoadingProgress'
import { useAppDispatch } from '../../store'
import { useCallback } from 'react'
import { skipConsistencyChecks } from '../dataSlice'

export const LoadingProgress = () => {
  const loadingProgress = useDataLoadingProgress()
  const dispatch = useAppDispatch()
  const onSkipPressed = useCallback(() => {
    dispatch(skipConsistencyChecks())
  }, [dispatch])
  return <LoadingProgressComponent {...loadingProgress} onSkipPressed={onSkipPressed} />
}
