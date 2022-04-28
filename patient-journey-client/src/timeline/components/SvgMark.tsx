import React from 'react'
import { LaneDisplayMode } from 'react-svg-timeline'

export const TIMELINE_MARK_SIZE_DEFAULT = 20
export const TIMELINE_MARK_SIZE_TO_LANE_HEIGHT_RATIO = 0.85
export const TIMELINE_MARK_STROKE_WIDTH = 2

interface SvgMarkProps {
  readonly size: number
  readonly color: string
  readonly stroke: string
  readonly onClick: () => void
  readonly onMouseEnter: () => void
  readonly onMouseLeave: () => void
}

export const SvgMark = ({ size, color, stroke, onClick, onMouseEnter, onMouseLeave }: SvgMarkProps) => {
  return (
    <circle
      r={size / 2}
      fill={color}
      stroke={stroke}
      strokeWidth={TIMELINE_MARK_STROKE_WIDTH}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    ></circle>
  )
}

export const calcMarkSize = (laneDisplayMode: LaneDisplayMode | undefined, laneHeight: number) => {
  return laneDisplayMode === 'expanded'
    ? Math.min(laneHeight * TIMELINE_MARK_SIZE_TO_LANE_HEIGHT_RATIO, TIMELINE_MARK_SIZE_DEFAULT)
    : TIMELINE_MARK_SIZE_DEFAULT
}
