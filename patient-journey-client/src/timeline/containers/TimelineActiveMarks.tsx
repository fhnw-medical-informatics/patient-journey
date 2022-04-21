import React from 'react'

import { CustomLayer, TimelineEvent } from 'react-svg-timeline'

import { useHoveredActiveEntityAsEvent, useSelectedActiveEntityAsEvent } from '../hooks'

import { TimelineActiveMarks as TimelineActiveMarksComponent } from '../components/TimelineActiveMarks'
import { useTheme } from '@mui/material'
import { useEntityInteraction } from '../../data/hooks'

export const TimelineActiveMarks: CustomLayer = (props) => {
  const theme = useTheme()

  const { onEntityClick, onEntityHover } = useEntityInteraction()

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
