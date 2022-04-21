import React from 'react'
import { PatientId } from '../../data/patients'
import {
  Timeline as SVGTimeline,
  LaneDisplayMode,
  TimelineEvent,
  TimelineLane,
  deriveTimelineTheme,
} from 'react-svg-timeline'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'
import { EntityId, EntityIdNone } from '../../data/entities'
import { useTheme } from '@mui/material'

import { TimelineCanvasMarks } from './TimelineCanvasMarks'
import { TimelineCanvasMarksInteraction } from '../containers/TimelineCanvasMarksInteraction'
import { MouseAwareSvg } from './MouseAwareSvg'
import { CursorPosition, CursorPositionNone } from '../timelineSlice'

interface TimelineProps {
  events: ReadonlyArray<TimelineEvent<PatientId, any>>
  lanes: ReadonlyArray<TimelineLane<any>>
  dateFormat: (ms: number) => string
  laneDisplayMode: LaneDisplayMode
  enableClustering: boolean
  onHover: (eventId: EntityId) => void
  onSelect: (eventId: EntityId) => void
  onCursorPositionChange: (cursorPosition: CursorPosition) => void
}

export const TimelineView = ({
  events,
  lanes,
  dateFormat,
  laneDisplayMode,
  enableClustering,
  onSelect,
  onHover,
  onCursorPositionChange,
}: TimelineProps) => {
  const muiTheme = useTheme()
  const timelineTheme = deriveTimelineTheme(muiTheme.palette.mode, muiTheme)

  if (events.length === 0) {
    return null
  }

  return (
    <div>
      <AutoSizer>
        {({ width, height }: Size) => {
          return (
            <MouseAwareSvg
              height={height}
              width={width}
              onMouseMove={({ x, y }) => {
                onCursorPositionChange(!isNaN(x) && !isNaN(y) ? { x, y } : CursorPositionNone)
              }}
            >
              <SVGTimeline
                width={width}
                height={height}
                events={events}
                lanes={lanes}
                dateFormat={dateFormat}
                laneDisplayMode={laneDisplayMode}
                enableEventClustering={enableClustering}
                theme={timelineTheme}
                onEventClick={onSelect}
                onEventHover={onHover}
                onEventUnhover={() => {
                  onHover(EntityIdNone)
                }}
                layers={['grid', 'axes', TimelineCanvasMarks, 'interaction', TimelineCanvasMarksInteraction]}
                onCursorMove={() => {}}
              />
            </MouseAwareSvg>
          )
        }}
      </AutoSizer>
    </div>
  )
}
