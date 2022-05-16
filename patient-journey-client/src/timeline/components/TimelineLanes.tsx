import { Axes } from './Axes'
import { Axis } from './Axis'
import { PatientJourneyCustomLayerProps } from './shared'

interface Props<LID extends string> extends PatientJourneyCustomLayerProps<LID> {
  readonly focusLaneId: LID
  readonly isHideLaneDetails: boolean
}

export const TimelineLanes = <LID extends string>({
  laneDisplayMode,
  lanes,
  focusLaneId,
  yScale,
  height,
  isHideLaneDetails,
}: Props<LID>) => {
  return laneDisplayMode === 'expanded' ? (
    <Axes key="axes" yScale={yScale} lanes={lanes} focusLaneId={focusLaneId} isHideLaneDetails={isHideLaneDetails} />
  ) : (
    <Axis key="axis" y={height / 2} />
  )
}
