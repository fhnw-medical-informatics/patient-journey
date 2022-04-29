import * as React from 'react'
import { useTimelineTheme } from 'react-svg-timeline'

interface Props {
  readonly y: number
  readonly color?: string
  readonly isFocused?: boolean
}

export const Axis = ({ y, color, isFocused }: Props) => {
  const theme = useTimelineTheme()
  const defaultStrokeWidth = theme.lane.middleLineWidth
  const strokeWidth = isFocused ? defaultStrokeWidth + 1 : defaultStrokeWidth
  return (
    <line
      x1={0}
      y1={y}
      x2="100%"
      y2={y}
      style={{
        stroke: color ?? theme.lane.middleLineColor,
        strokeWidth,
      }}
    />
  )
}
