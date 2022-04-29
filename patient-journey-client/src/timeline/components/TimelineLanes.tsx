import { CustomLayerProps, TimelineEvent } from 'react-svg-timeline'
import { Axes } from './Axes'
import { Axis } from './Axis'

interface Props<EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>
  extends CustomLayerProps<EID, LID, E> {
  readonly focusLaneId: LID
}

export const TimelineLanes = <EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>({
  laneDisplayMode,
  lanes,
  focusLaneId,
  yScale,
  height,
}: Props<EID, LID, E>) => {
  return laneDisplayMode === 'expanded' ? (
    <Axes key="axes" yScale={yScale} lanes={lanes} focusLaneId={focusLaneId} />
  ) : (
    <Axis key="axis" y={height / 2} />
  )
}
