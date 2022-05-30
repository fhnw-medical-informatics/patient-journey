import React from 'react'

import { CustomLayer, CustomLayerProps, TimelineEvent } from 'react-svg-timeline'
import { useSplitPlaneResizing } from '../../data/hooks'

import { TimelineCanvasMarks as TimelineCanvasMarksComponent } from '../components/TimelineCanvasMarks'

const TimelineCanvasMarks = <EID extends string, PatientId extends string, E extends TimelineEvent<EID, PatientId>>(
  props: CustomLayerProps<EID, PatientId, E>
) => {
  const isPaneResizing = useSplitPlaneResizing()

  return <TimelineCanvasMarksComponent {...props} isPaneResizing={isPaneResizing} />
}

// A passthrough component is needed to prevent the whole timeline from re-rendering
// when the container hooks change.
export const TimelineCanvasMarksLayer: CustomLayer = (props) => {
  return <TimelineCanvasMarks {...props} />
}
