import { CustomLayer, CustomLayerProps, TimelineEvent } from 'react-svg-timeline'
import { TimelineLanes as TimelineLanesComponent } from '../components/TimelineLanes'
import { useFocusLaneId } from '../hooks'

const HIDE_LANE_DETAILS_HEIGHT_THRESHOLD = 10

interface Props<EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>
  extends CustomLayerProps<EID, LID, E> {}

export const TimelineLanes = <EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>(
  props: Props<EID, LID, E>
) => {
  const focusLaneId = useFocusLaneId()
  const isHideLaneDetails = props.yScale.bandwidth() < HIDE_LANE_DETAILS_HEIGHT_THRESHOLD
  return <TimelineLanesComponent {...props} focusLaneId={focusLaneId} isHideLaneDetails={isHideLaneDetails} />
}

// A passthrough component is needed to prevent the whole timeline from re-rendering
// when the container hooks change.
export const TimelineLanesLayer: CustomLayer = (props) => {
  return <TimelineLanes {...props} />
}
