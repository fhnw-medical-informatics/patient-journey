import { CustomLayerProps, TimelineEvent } from 'react-svg-timeline'
import { Axes } from './Axes'
import { Axis } from './Axis'

interface Props<EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>
  extends CustomLayerProps<EID, LID, E> {}

export const TimelineAxesLayer = <EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>({
  laneDisplayMode,
  lanes,
  yScale,
  height,
}: Props<EID, LID, E>) => {
  return laneDisplayMode === 'expanded' ? (
    <Axes key="axes" lanes={lanes} yScale={yScale} />
  ) : (
    <Axis key="axis" y={height / 2} />
  )
}
