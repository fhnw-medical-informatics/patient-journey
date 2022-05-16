import React from 'react'

import { useHoveredActiveEvent, useSelectedActiveEvent } from '../hooks'

import { TimelineActiveMarks as TimelineActiveMarksComponent } from '../components/TimelineActiveMarks'
import { useTheme } from '@mui/material'
import { useEntityInteraction } from '../../data/hooks'
import { PatientJourneyCustomLayerProps } from '../components/shared'
import { CustomLayer } from 'react-svg-timeline'

const TimelineActiveMarks = <LID extends string>(props: PatientJourneyCustomLayerProps<LID>) => {
  const theme = useTheme()

  const { onEntityClick, onEntityHover } = useEntityInteraction('events')

  const selectedEvent = useSelectedActiveEvent()
  const hoveredEvent = useHoveredActiveEvent()

  return (
    <TimelineActiveMarksComponent
      {...props}
      selectedEvent={selectedEvent}
      hoveredEvent={hoveredEvent}
      selectedColor={theme.entityColors.selected}
      onHover={onEntityHover}
      onSelect={onEntityClick}
    />
  )
}

// A passthrough component is needed to prevent the whole timeline from re-rendering
// when the container hooks change.
export const TimelineActiveMarksLayer: CustomLayer = <LID extends string>(
  props: PatientJourneyCustomLayerProps<LID>
) => {
  return <TimelineActiveMarks {...props} />
}
