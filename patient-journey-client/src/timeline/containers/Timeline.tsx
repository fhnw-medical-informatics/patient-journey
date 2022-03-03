import { Timeline as TimelineComponent } from '../components/Timeline'
import { useAppSelector } from '../../store'
import { useAppDispatch } from '../../store'
import { setTimelineType, TimelineType } from '../timelineSlice'

const dateFormat = (ms: number) => new Date(ms).toLocaleString()

export const Timeline = () => {
  const data = useAppSelector((s) => s.data)
  const dispatch = useAppDispatch()
  const onSetTimelineType = (type: TimelineType) => dispatch(setTimelineType(type))
  const timelineState = useAppSelector((state) => state.timeline)

  return (
    <TimelineComponent
      dateFormat={dateFormat}
      laneDisplayMode={'expanded'}
      data={data}
      onSetTimelineType={onSetTimelineType}
      timelineState={timelineState}
    />
  )
}
