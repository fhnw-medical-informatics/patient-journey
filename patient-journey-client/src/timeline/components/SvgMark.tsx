import React from 'react'

export const TIMELINE_MARK_SIZE = 20
export const TIMELINE_MARK_STROKE_WIDTH = 2

interface SvgMarkProps {
  color: string
  stroke: string
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export const SvgMark = ({ color, stroke, onClick, onMouseEnter, onMouseLeave }: SvgMarkProps) => {
  return (
    <circle
      r={TIMELINE_MARK_SIZE / 2}
      fill={color}
      stroke={stroke}
      strokeWidth={TIMELINE_MARK_STROKE_WIDTH}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    ></circle>
  )
}
