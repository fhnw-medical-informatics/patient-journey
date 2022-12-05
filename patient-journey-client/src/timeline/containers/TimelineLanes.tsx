import { CustomLayer, CustomLayerProps, TimelineEvent } from 'react-svg-timeline'
import { useIndexPatientId } from '../../data/hooks'
import { PatientIdNone } from '../../data/patients'
import { TimelineLanes as TimelineLanesComponent } from '../components/TimelineLanes'
import { useExpandByColumn, useHoveredLaneId, useSelectedLaneId } from '../hooks'
import { TimelineColumnNone } from '../timelineSlice'

export const HIDE_LANE_DETAILS_HEIGHT_THRESHOLD = 10

interface Props<EID extends string, PatientId extends string, E extends TimelineEvent<EID, PatientId>>
  extends CustomLayerProps<EID, PatientId, E> {}

export const TimelineLanes = <EID extends string, PatientId extends string, E extends TimelineEvent<EID, PatientId>>(
  props: Props<EID, PatientId, E>
) => {
  const hoveredLaneId = useHoveredLaneId()
  const selectedLaneId = useSelectedLaneId()
  const indexPatientId = useIndexPatientId()
  const expandByColumn = useExpandByColumn()

  const isHideLaneDetails = props.yScale.bandwidth() < HIDE_LANE_DETAILS_HEIGHT_THRESHOLD

  return (
    <TimelineLanesComponent
      {...props}
      focusLaneId={
        expandByColumn !== TimelineColumnNone && expandByColumn.type === 'pid' ? hoveredLaneId : PatientIdNone
      }
      selectedEntityId={
        expandByColumn !== TimelineColumnNone && expandByColumn.type === 'pid' ? selectedLaneId : PatientIdNone
      }
      indexPatientId={indexPatientId}
      isHideLaneDetails={isHideLaneDetails}
    />
  )
}

// A passthrough component is needed to prevent the whole timeline from re-rendering
// when the container hooks change.
export const TimelineLanesLayer: CustomLayer = (props) => {
  return <TimelineLanes {...props} />
}
