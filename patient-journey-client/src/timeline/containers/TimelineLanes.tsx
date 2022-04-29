import { CustomLayer, CustomLayerProps, TimelineEvent } from 'react-svg-timeline'
import { TimelineLanes as TimelineLanesComponent } from '../components/TimelineLanes'
import { useFocusLaneId } from '../hooks'

interface Props<EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>
  extends CustomLayerProps<EID, LID, E> {}

export const TimelineLanes = <EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>(
  props: Props<EID, LID, E>
) => {
  const focusLaneId = useFocusLaneId()
  return <TimelineLanesComponent {...props} focusLaneId={focusLaneId} />
}

// A passthrough component is needed to prevent the whole timeline from re-rendering
// when the container hooks change.
export const TimelineLanesLayer: CustomLayer = (props) => {
  return <TimelineLanes {...props} />
}
