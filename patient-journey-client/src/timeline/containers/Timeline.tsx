import { Timeline as TimelineComponent } from '../components/Timeline'
import { useAppSelector } from '../../store'

const dateFormat = (ms: number) => new Date(ms).toLocaleString()

export const Timeline = () => {
  const data = useAppSelector((s) => s.data)
  return <TimelineComponent dateFormat={dateFormat} laneDisplayMode={'expanded'} data={data} />
}
