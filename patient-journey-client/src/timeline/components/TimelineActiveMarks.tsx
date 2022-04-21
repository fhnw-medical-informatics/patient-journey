import React from 'react'
import { useTheme } from '@mui/material'

import { CustomLayerProps, TimelineEvent } from 'react-svg-timeline'

interface TimelineActiveMarksProps<EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>
  extends CustomLayerProps<EID, LID, E> {
  selectedEvent: TimelineEvent<EID, LID> | undefined
  hoveredEvent: TimelineEvent<EID, LID> | undefined
}

export const TimelineActiveMarks = <EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>({
  yScale,
  xScale,
  laneDisplayMode,
  height,
  selectedEvent,
  hoveredEvent,
}: TimelineActiveMarksProps<EID, LID, E>) => {
  const theme = useTheme()

  const createCirce = (event: TimelineEvent<EID, LID>) => {
    const x = Math.round(xScale(event.startTimeMillis))
    const y = Math.round(laneDisplayMode === 'collapsed' ? height / 2 : yScale(event.laneId) ?? height / 2)

    return (
      <circle
        cx={x}
        cy={y}
        r={10}
        fill={event.color}
        stroke={theme.palette.text.primary}
        strokeWidth={2}
        //   onClick={onClick}
        //   onMouseEnter={onMouseEnter}
        //   onMouseLeave={onMouseLeave}
      ></circle>
    )
  }

  return (
    <>
      {hoveredEvent && createCirce(hoveredEvent)}
      {selectedEvent && createCirce(selectedEvent)}
    </>
  )
}
