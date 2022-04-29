import React from 'react'
import { ScaleBand } from 'd3-scale'
import { TimelineLane, useTimelineTheme } from 'react-svg-timeline'
import { Axis } from './Axis'
import { useTheme } from '@mui/material'

const MAX_LABEL_FONT_SIZE = 18

export interface AxesProps<LID extends string> {
  readonly focusLaneId: LID
  readonly lanes: ReadonlyArray<TimelineLane<LID>>
  readonly yScale: ScaleBand<LID>
  readonly isHideLaneDetails: boolean
}

export const Axes = <LID extends string>({ focusLaneId, lanes, yScale, isHideLaneDetails }: AxesProps<LID>) => {
  const isDarkMode = useTheme().palette.mode === 'dark'
  const theme = useTimelineTheme()

  // TODO: Improve font handling
  // - re-implement using canvas (proper font metrics)
  // - foreignObject (CSS alignment and background color) https://stackoverflow.com/a/48194342/57448

  const fontSize = isHideLaneDetails ? MAX_LABEL_FONT_SIZE : Math.min(yScale.bandwidth(), MAX_LABEL_FONT_SIZE)
  const textBackgroundRectWidth = fontSize * 3.7
  const labelXOffset = 15
  return (
    <>
      {lanes.map((lane: TimelineLane<LID>) => {
        const y = yScale(lane.laneId)!
        const isFocused = lane.laneId === focusLaneId
        const fontWeight = isFocused ? 800 : 600
        const opacity = isFocused ? 0.8 : 0.4
        const isEnabled = isFocused || !isHideLaneDetails
        return (
          isEnabled && (
            <g key={`axis-${lane.laneId}`}>
              <Axis y={y} color={lane.color} isFocused={isFocused} />
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
                  fontWeight,
                  opacity,
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
        )
      })}
    </>
  )
}