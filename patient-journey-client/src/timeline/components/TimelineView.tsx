import React from 'react'
import { PatientId } from '../../data/patients'
import {
  Timeline as SVGTimeline,
  LaneDisplayMode,
  TimelineEvent,
  TimelineLane,
  createTimelineTheme,
} from 'react-svg-timeline'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'
import { useCustomTheme } from '../../theme'

interface TimelineProps {
  events: ReadonlyArray<TimelineEvent<PatientId, PatientId>>
  lanes: ReadonlyArray<TimelineLane<PatientId>>
  dateFormat: (ms: number) => string
  laneDisplayMode: LaneDisplayMode
  enableClustering: boolean
}

export const TimelineView = ({ events, lanes, dateFormat, laneDisplayMode, enableClustering }: TimelineProps) => {
  const theme = useCustomTheme()

  const timelineTheme = createTimelineTheme(theme as any, {
    xAxis: {
      labelColor: theme.palette.text.primary,
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
            <SVGTimeline
              width={width}
              height={height}
              events={events}
              lanes={lanes}
              dateFormat={dateFormat}
              laneDisplayMode={laneDisplayMode}
              enableEventClustering={enableClustering}
              theme={timelineTheme}
            />
          )
        }}
      </AutoSizer>
    </div>
  )
}