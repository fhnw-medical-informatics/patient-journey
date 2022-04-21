import React from 'react'

import { CustomLayer } from 'react-svg-timeline'

import { useTimlineCursorPosition } from '../hooks'

import { TimelineCanvasMarksInteraction as TimelineCanvasMarksInteractionComponent } from '../components/TimelineCanvasMarksInteraction'
import { useEntityInteraction } from '../../data/hooks'

export const TimelineCanvasMarksInteraction: CustomLayer = (props) => {
  const cursorPosition = useTimlineCursorPosition()
  const { onEntityClick, onEntityHover } = useEntityInteraction()

  return (
    <TimelineCanvasMarksInteractionComponent
      {...props}
      cursorPosition={cursorPosition}
      onSelect={onEntityClick}
      onHover={onEntityHover}
    />
  )
}
