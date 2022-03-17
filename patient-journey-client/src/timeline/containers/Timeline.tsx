import { Timeline as TimelineComponent } from '../components/Timeline'
import { useAppDispatch } from '../../store'
import { setTimelineCluster, setTimelineGrouping, setTimelineColumn, TimelineColumn } from '../timelineSlice'
import { useActiveDataColumns } from '../../data/hooks'
import { formatMillis } from '../../data/columns'
import { useActiveDataAsEvents, useActiveDataAsLanes, useTimelineState } from '../hooks'

export const Timeline = () => {
  const events = useActiveDataAsEvents()
  const lanes = useActiveDataAsLanes()
  const timelineState = useTimelineState()
  const activeColumns = useActiveDataColumns()

  const dispatch = useAppDispatch()

  const onSetTimelineColumn = (column: TimelineColumn) => dispatch(setTimelineColumn(column))
  const onSetTimelineCluster = () => dispatch(setTimelineCluster())
  const onSetTimelineGrouping = () => dispatch(setTimelineGrouping())

  return (
    <TimelineComponent
      dateFormat={formatMillis}
      laneDisplayMode={timelineState.grouping ? 'collapsed' : 'expanded'}
      events={events}
      lanes={lanes}
      onSetTimelineColumn={onSetTimelineColumn}
      onSetTimelineCluster={onSetTimelineCluster}
      onSetTimelineGrouping={onSetTimelineGrouping}
      timelineState={timelineState}
      availableColumns={activeColumns}
    />
  )
}
