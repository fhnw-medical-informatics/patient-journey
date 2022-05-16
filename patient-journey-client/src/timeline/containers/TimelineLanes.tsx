import { TimelineLanes as TimelineLanesComponent } from '../components/TimelineLanes'
import { useFocusLaneId } from '../hooks'
import { PatientJourneyCustomLayerProps } from '../components/shared'
import { CustomLayer } from 'react-svg-timeline'

const HIDE_LANE_DETAILS_HEIGHT_THRESHOLD = 10

export const TimelineLanes = <LID extends string>(props: PatientJourneyCustomLayerProps<LID>) => {
  const focusLaneId = useFocusLaneId()
  const isHideLaneDetails = props.yScale.bandwidth() < HIDE_LANE_DETAILS_HEIGHT_THRESHOLD
  return <TimelineLanesComponent {...props} focusLaneId={focusLaneId} isHideLaneDetails={isHideLaneDetails} />
}

// A passthrough component is needed to prevent the whole timeline from re-rendering
// when the container hooks change.
export const TimelineLanesLayer: CustomLayer = <LID extends string>(props: PatientJourneyCustomLayerProps<LID>) => {
  return <TimelineLanes {...props} />
}
