import React from 'react'

import { CustomLayer, CustomLayerProps, TimelineEvent } from 'react-svg-timeline'

import { useHoveredActiveEntityAsEvent, useSelectedActiveEntityAsEvent } from '../hooks'

import { TimelineActiveMarks as TimelineActiveMarksComponent } from '../components/TimelineActiveMarks'
import { useTheme } from '@mui/material'
import { useEntityInteraction } from '../../data/hooks'

const TimelineActiveMarks = <EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>(
  props: CustomLayerProps<EID, LID, E>
) => {
  const theme = useTheme()

  const { onEntityClick, onEntityHover } = useEntityInteraction('event')

  const selectedEvent = useSelectedActiveEntityAsEvent()
  const hoveredEvent = useHoveredActiveEntityAsEvent()

  return (
    <TimelineActiveMarksComponent
      {...props}
      selectedEvent={selectedEvent as TimelineEvent<any, any>}
      hoveredEvent={hoveredEvent as TimelineEvent<any, any>}
      selectedColor={theme.entityColors.selected}
      onHover={onEntityHover}
      onSelect={onEntityClick}
    />
  )
}

// A passthrough component is needed to prevent the whole timeline from re-rendering
// when the container hooks change.
export const TimelineActiveMarksLayer: CustomLayer = (props) => {
  return <TimelineActiveMarks {...props} />
}
