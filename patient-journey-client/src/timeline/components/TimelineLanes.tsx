import { CustomLayerProps, TimelineEvent } from 'react-svg-timeline'
import { Axes } from './Axes'
import { Axis } from './Axis'

interface Props<EID extends string, PatientId extends string, E extends TimelineEvent<EID, PatientId>>
  extends CustomLayerProps<EID, PatientId, E> {
  readonly focusLaneId: PatientId
  readonly isHideLaneDetails: boolean
}

export const TimelineLanes = <EID extends string, PatientId extends string, E extends TimelineEvent<EID, PatientId>>({
  laneDisplayMode,
  lanes,
  focusLaneId,
  yScale,
  height,
  isHideLaneDetails,
}: Props<EID, PatientId, E>) => {
  return laneDisplayMode === 'expanded' ? (
    <Axes key="axes" yScale={yScale} lanes={lanes} focusLaneId={focusLaneId} isHideLaneDetails={isHideLaneDetails} />
  ) : (
    <Axis key="axis" y={height / 2} />
  )
}
