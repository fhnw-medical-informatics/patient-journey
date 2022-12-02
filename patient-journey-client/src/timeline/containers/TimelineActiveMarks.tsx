import React from 'react'

import { CustomLayer, CustomLayerProps, TimelineEvent } from 'react-svg-timeline'

import { useHoveredActiveEvent, useSelectedActiveEvent } from '../hooks'

import { TimelineActiveMarks as TimelineActiveMarksComponent } from '../components/TimelineActiveMarks'
import { useTheme } from '@mui/material'
import { useEntityInteraction } from '../../data/hooks'
import { useColor } from '../../color/hooks'

const TimelineActiveMarks = <EID extends string, PatientId extends string, E extends TimelineEvent<EID, PatientId>>(
  props: CustomLayerProps<EID, PatientId, E>
) => {
  const theme = useTheme()

  const { colorByColumnFn } = useColor('events')
  const { onEntityClick, onEntityHover } = useEntityInteraction('events')

  const selectedEvent = useSelectedActiveEvent(
    colorByColumnFn,
    theme.entityColors.filteredOut,
    theme.entityColors.indexPatient
  )
  const hoveredEvent = useHoveredActiveEvent(
    colorByColumnFn,
    theme.entityColors.filteredOut,
    theme.entityColors.indexPatient
  )

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
