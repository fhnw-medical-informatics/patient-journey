import React from 'react'
import { LaneDisplayMode } from 'react-svg-timeline'
import { HIDE_LANE_DETAILS_HEIGHT_THRESHOLD } from '../containers/TimelineLanes'

export const TIMELINE_MARK_SIZE_DEFAULT = 20
export const TIMELINE_MARK_SIZE_TO_LANE_HEIGHT_RATIO = 0.85
export const TIMELINE_MARK_STROKE_WIDTH = 2
export const TIMELINE_MARK_MIN_SIZE = 2
export const TIMELINE_MARK_MIN_SIZE_FANCY = HIDE_LANE_DETAILS_HEIGHT_THRESHOLD * TIMELINE_MARK_SIZE_TO_LANE_HEIGHT_RATIO

interface SvgMarkProps {
  readonly size: number
  readonly color: string
  readonly stroke: string
  readonly onClick: (e: React.MouseEvent<SVGCircleElement, MouseEvent>) => void
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
    ? Math.max(
        Math.round(Math.min(laneHeight * TIMELINE_MARK_SIZE_TO_LANE_HEIGHT_RATIO, TIMELINE_MARK_SIZE_DEFAULT)),
        TIMELINE_MARK_MIN_SIZE
      )
    : TIMELINE_MARK_SIZE_DEFAULT
}
