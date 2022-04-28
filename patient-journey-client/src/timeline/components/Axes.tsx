import React from 'react'
import { ScaleBand } from 'd3-scale'
import { TimelineLane, useTimelineTheme } from 'react-svg-timeline'
import { Axis } from './Axis'
import { useTheme } from '@mui/material'

export interface AxesProps<LID extends string> {
  readonly lanes: ReadonlyArray<TimelineLane<LID>>
  readonly yScale: ScaleBand<LID>
}

export const Axes = <LID extends string>({ lanes, yScale }: AxesProps<LID>) => {
  const isDarkMode = useTheme().palette.mode === 'dark'
  const theme = useTimelineTheme()

  // TODO: Improve font handling
  // - re-implement using canvas (proper font metrics)
  // - foreignObject (CSS alignment and background color) https://stackoverflow.com/a/48194342/57448

  const fontSize = Math.min(yScale.bandwidth(), 18)
  const textBackgroundRectWidth = fontSize * 3.7
  const labelXOffset = 15
  return (
    <>
      {lanes.map((lane: TimelineLane<LID>) => {
        const y = yScale(lane.laneId)!
        return (
          <g key={`axis-${lane.laneId}`}>
            <Axis y={y} color={lane.color} />
            <rect
              x={labelXOffset - 3}
              width={textBackgroundRectWidth}
              height={theme.lane.labelFontSize}
              y={y - theme.lane.labelFontSize / 2}
              fill={isDarkMode ? 'rgb(30,30,30)' : theme.base.backgroundColor}
            ></rect>
            <text
              style={{
                fontFamily: theme.base.fontFamily,
                fontWeight: 600,
                opacity: 0.4,
                dominantBaseline: 'central',
              }}
              fontSize={fontSize}
              x={labelXOffset}
              y={y}
              fill={lane.color || theme.lane.labelColor}
            >
              {lane.label}
            </text>
          </g>
        )
      })}
    </>
  )
}
