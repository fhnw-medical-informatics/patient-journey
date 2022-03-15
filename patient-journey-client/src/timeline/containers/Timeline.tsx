import { Timeline as TimelineComponent } from '../components/Timeline'
import { useAppSelector } from '../../store'
import { useAppDispatch } from '../../store'
import { setTimelineCluster, setTimelineGrouping, setTimelineColumn, TimelineColumn } from '../timelineSlice'
import { useActiveDataColumns, useFilteredActiveData } from '../../data/hooks'

const dateFormat = (ms: number) => new Date(ms).toLocaleString()

export const Timeline = () => {
  const activeData = useFilteredActiveData()
  const dispatch = useAppDispatch()
  const onSetTimelineColumns = (column: TimelineColumn) => dispatch(setTimelineColumn(column))
  const onSetTimelineCluster = () => dispatch(setTimelineCluster())
  const onSetTimelineGrouping = () => dispatch(setTimelineGrouping())
  const timelineState = useAppSelector((state) => state.timeline)
  const activeColumns = useActiveDataColumns()

  return (
    <TimelineComponent
      dateFormat={dateFormat}
      laneDisplayMode={'expanded'}
      data={activeData}
      onSetTimelineColumn={onSetTimelineColumns}
      onSetTimelineCluster={onSetTimelineCluster}
      onSetTimelineGrouping={onSetTimelineGrouping}
      timelineState={timelineState}
      availableColumns={activeColumns}
    />
  )
}
