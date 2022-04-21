import React from 'react'

import { CustomLayer, TimelineEvent } from 'react-svg-timeline'

import { useHoveredActiveEntityAsEvent, useSelectedActiveEntityAsEvent } from '../hooks'

import { TimelineActiveMarks as TimelineActiveMarksComponent } from '../components/TimelineActiveMarks'
import { useTheme } from '@mui/material'

export const TimelineActiveMarks: CustomLayer = (props) => {
  const theme = useTheme()

  const selectedEvent = useSelectedActiveEntityAsEvent(theme.entityColors.selected)
  const hoveredEvent = useHoveredActiveEntityAsEvent(theme.entityColors.selected)

  return (
    <TimelineActiveMarksComponent
      {...props}
      selectedEvent={selectedEvent as TimelineEvent<any, any>}
      hoveredEvent={hoveredEvent as TimelineEvent<any, any>}
    />
  )
}
