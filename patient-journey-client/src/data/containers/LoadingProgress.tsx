import { useDataLoadingProgress } from '../hooks'
import { LoadingProgress as LoadingProgressComponent } from '../components/LoadingProgress'

export const LoadingProgress = () => {
  const loadingProgress = useDataLoadingProgress()
  return <LoadingProgressComponent loadingProgress={loadingProgress} />
}
