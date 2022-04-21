import React from 'react'

import { CustomLayer } from 'react-svg-timeline'

import { useTimlineCursorPosition } from '../hooks'

import { TimelineCanvasMarksInteraction as TimelineCanvasMarksInteractionComponent } from '../components/TimelineCanvasMarksInteraction'

export const TimelineCanvasMarksInteraction: CustomLayer = (props) => {
  const cursorPosition = useTimlineCursorPosition()

  return <TimelineCanvasMarksInteractionComponent {...props} cursorPosition={cursorPosition} />
}
