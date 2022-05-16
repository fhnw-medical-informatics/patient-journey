import React from 'react'
import { deriveTimelineTheme, LaneDisplayMode, Timeline as SVGTimeline, TimelineLane } from 'react-svg-timeline'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'
import { useTheme } from '@mui/material'

import { TimelineCanvasMarksLayer } from './TimelineCanvasMarks'
import { TimelineCanvasMarksInteractionLayer } from '../containers/TimelineCanvasMarksInteraction'
import { MouseAwareSvg } from './MouseAwareSvg'
import { CursorPosition, CursorPositionNone } from '../timelineSlice'
import { TimelineActiveMarksLayer } from '../containers/TimelineActiveMarks'
import { TimelineLanesLayer } from '../containers/TimelineLanes'
import { PatientJourneyTimelineEvent } from './shared'

const INVISIBLE_LAYER = () => null

interface Props<LID extends string> {
  events: ReadonlyArray<PatientJourneyTimelineEvent<LID>>
  lanes: ReadonlyArray<TimelineLane<LID>>
  dateFormat: (ms: number) => string
  laneDisplayMode: LaneDisplayMode
  enableClustering: boolean
  showTimeGrid: boolean
  onCursorPositionChange: (cursorPosition: CursorPosition) => void
  onInteractionEnd: () => void
}

export const TimelineView = <LID extends string>({
  events,
  lanes,
  dateFormat,
  laneDisplayMode,
  enableClustering,
  showTimeGrid,
  onCursorPositionChange,
  onInteractionEnd,
}: Props<LID>) => {
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
                layers={[
                  showTimeGrid ? 'grid' : INVISIBLE_LAYER,
                  TimelineLanesLayer,
                  TimelineCanvasMarksLayer,
                  'interaction',
                  TimelineCanvasMarksInteractionLayer,
                  TimelineActiveMarksLayer,
                ]}
                onInteractionEnd={onInteractionEnd}
              />
            </MouseAwareSvg>
          )
        }}
      </AutoSizer>
    </div>
  )
}
