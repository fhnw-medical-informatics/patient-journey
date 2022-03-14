import { Timeline as TimelineComponent } from '../components/Timeline'
import { useAppSelector } from '../../store'
import { useAppDispatch } from '../../store'
import { setTimelineCluster, setTimelineGrouping, setTimelineType } from '../timelineSlice'
import { useActiveDataColumns } from '../../data/hooks'

const dateFormat = (ms: number) => new Date(ms).toLocaleString()

export const Timeline = () => {
  const data = useAppSelector((s) => s.data)
  const dispatch = useAppDispatch()
  const onSetTimelineColumns = (column: number) => dispatch(setTimelineType(column))
  const onSetTimelineCluster = () => dispatch(setTimelineCluster())
  const onSetTimelineGrouping = () => dispatch(setTimelineGrouping())
  const timelineState = useAppSelector((state) => state.timeline)
  const activeColumns = useActiveDataColumns()

  return (
    <TimelineComponent
      dateFormat={dateFormat}
      laneDisplayMode={'expanded'}
      data={data}
      onSetTimelineColumn={onSetTimelineColumns}
      onSetTimelineCluster={onSetTimelineCluster}
      onSetTimelineGrouping={onSetTimelineGrouping}
      timelineState={timelineState}
      availableColumns={activeColumns}
    />
  )
}
