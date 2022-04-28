import * as React from 'react'
import { useTimelineTheme } from 'react-svg-timeline'

interface Props {
  readonly y: number
  readonly color?: string
}

export const Axis = ({ y, color }: Props) => {
  const theme = useTimelineTheme()
  return (
    <line
      x1={0}
      y1={y}
      x2="100%"
      y2={y}
      style={{
        stroke: color ?? theme.lane.middleLineColor,
        strokeWidth: theme.lane.middleLineWidth,
      }}
    />
  )
}
