import React from 'react'
import { PatientId } from '../../data/patients'
import {
  deriveTimelineTheme,
  InteractionModeType,
  LaneDisplayMode,
  Timeline as SVGTimeline,
  TimelineEvent,
  TimelineLane,
} from 'react-svg-timeline'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'
import { useTheme } from '@mui/material'

import { TimelineCanvasMarksLayer } from '../containers/TimelineCanvasMarks'
import { TimelineCanvasMarksInteractionLayer } from '../containers/TimelineCanvasMarksInteraction'
import { MouseAwareSvg } from './MouseAwareSvg'
import { CursorPosition, CursorPositionNone } from '../timelineSlice'
import { TimelineActiveMarksLayer } from '../containers/TimelineActiveMarks'
import { TimelineLanesLayer } from '../containers/TimelineLanes'
import { TimelineJourneysLayer } from '../containers/TimelineJourneys'

const INVISIBLE_LAYER = () => null

interface TimelineProps {
  events: ReadonlyArray<TimelineEvent<PatientId, any>>
  lanes: ReadonlyArray<TimelineLane<any>>
  dateFormat: (ms: number) => string
  laneDisplayMode: LaneDisplayMode
  enableClustering: boolean
  showTimeGrid: boolean
  allowInteraction: boolean
  onCursorPositionChange: (cursorPosition: CursorPosition) => void
  onInteractionEnd: () => void
  onTimelineClick: () => void
}

export const TimelineView = ({
  events,
  lanes,
  dateFormat,
  laneDisplayMode,
  enableClustering,
  showTimeGrid,
  allowInteraction,
  onCursorPositionChange,
  onInteractionEnd,
  onTimelineClick,
}: TimelineProps) => {
  const muiTheme = useTheme()
  const timelineTheme = deriveTimelineTheme(muiTheme.palette.mode, muiTheme, {
    lane: {
      middleLineColor: muiTheme.entityColors.default,
      middleLineWidth: 1,
    },
  })

  if (events.length === 0) {
    return null
  }

  return (
    <div>
      <AutoSizer>
        {({ width, height }: Size) => {
          return (
            // A wrapper div to capture clicks on the timeline
            <div onClick={onTimelineClick}>
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
                    TimelineJourneysLayer,
                    'interaction',
                    TimelineCanvasMarksInteractionLayer,
                    TimelineActiveMarksLayer,
                  ]}
                  enabledInteractions={
                    allowInteraction
                      ? [
                          InteractionModeType.Hover,
                          InteractionModeType.Zoom,
                          InteractionModeType.Pan,
                          InteractionModeType.RubberBand,
                        ]
                      : [InteractionModeType.Hover]
                  }
                  onInteractionEnd={onInteractionEnd}
                />
              </MouseAwareSvg>
            </div>
          )
        }}
      </AutoSizer>
    </div>
  )
}
