import { Timeline as TimelineComponent } from '../components/Timeline'

const dateFormat = (ms: number) => new Date(ms).toLocaleString()

export const Timeline = () => {
  return (
    <TimelineComponent
      dateFormat={dateFormat}
      laneDisplayMode={'expanded'}
      /* suppressMarkAnimation={false}
      isTrimming={false}
      enableClustering={false}
      useCustomRange={false} */
    />
  )
}
