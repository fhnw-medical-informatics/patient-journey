import React from 'react'

import { useTimelineCursorPosition } from '../hooks'

import { TimelineCanvasMarksInteraction as TimelineCanvasMarksInteractionComponent } from '../components/TimelineCanvasMarksInteraction'
import { useEntityInteraction } from '../../data/hooks'
import { PatientJourneyCustomLayerProps } from '../components/shared'
import { CustomLayer } from 'react-svg-timeline'

const TimelineCanvasMarksInteraction = <LID extends string>(props: PatientJourneyCustomLayerProps<LID>) => {
  const cursorPosition = useTimelineCursorPosition()

  const { onEntityClick, onEntityHover } = useEntityInteraction('events')

  return (
    <TimelineCanvasMarksInteractionComponent
      {...props}
      cursorPosition={cursorPosition}
      onSelect={onEntityClick}
      onHover={onEntityHover}
    />
  )
}

// A passthrough component is needed to prevent the whole timeline from re-rendering
// when the container hooks change.
export const TimelineCanvasMarksInteractionLayer: CustomLayer = <LID extends string>(
  props: PatientJourneyCustomLayerProps<LID>
) => {
  return <TimelineCanvasMarksInteraction {...props} />
}
