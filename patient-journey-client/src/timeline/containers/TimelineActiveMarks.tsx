import React from 'react'

import { CustomLayer, TimelineEvent } from 'react-svg-timeline'

import { useHoveredActiveEntityAsEvent, useSelectedActiveEntityAsEvent } from '../hooks'

import { TimelineActiveMarks as TimelineActiveMarksComponent } from '../components/TimelineActiveMarks'
import { useTheme } from '@mui/material'
import { useColor } from '../../color/useColor'

export const TimelineActiveMarks: CustomLayer = (props) => {
  const theme = useTheme()

  const [colorByColumnFn] = useColor()

  const selectedEvent = useSelectedActiveEntityAsEvent(colorByColumnFn)
  const hoveredEvent = useHoveredActiveEntityAsEvent(colorByColumnFn)

  return (
    <TimelineActiveMarksComponent
      {...props}
      selectedEvent={selectedEvent as TimelineEvent<any, any>}
      hoveredEvent={hoveredEvent as TimelineEvent<any, any>}
      selectedColor={theme.entityColors.selected}
    />
  )
}
