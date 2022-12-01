import { CustomLayer, CustomLayerProps, TimelineEvent } from 'react-svg-timeline'
import { useSelectedEntity } from '../../data/hooks'
import { PatientIdNone } from '../../data/patients'
import { TimelineLanes as TimelineLanesComponent } from '../components/TimelineLanes'
import { useFocusLaneId } from '../hooks'

export const HIDE_LANE_DETAILS_HEIGHT_THRESHOLD = 10

interface Props<EID extends string, PatientId extends string, E extends TimelineEvent<EID, PatientId>>
  extends CustomLayerProps<EID, PatientId, E> {}

export const TimelineLanes = <EID extends string, PatientId extends string, E extends TimelineEvent<EID, PatientId>>(
  props: Props<EID, PatientId, E>
) => {
  const focusLaneId = useFocusLaneId()
  const selectedEntity = useSelectedEntity()
  const isHideLaneDetails = props.yScale.bandwidth() < HIDE_LANE_DETAILS_HEIGHT_THRESHOLD

  return (
    <TimelineLanesComponent
      {...props}
      focusLaneId={focusLaneId}
      selectedEntityId={selectedEntity.type === 'patients' ? selectedEntity.uid : PatientIdNone}
      isHideLaneDetails={isHideLaneDetails}
    />
  )
}

// A passthrough component is needed to prevent the whole timeline from re-rendering
// when the container hooks change.
export const TimelineLanesLayer: CustomLayer = (props) => {
  return <TimelineLanes {...props} />
}
