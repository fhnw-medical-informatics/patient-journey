import React, { useRef } from 'react'

interface Props {
  width: number
  height: number
  onMouseMove: (position: { x: number; y: number }) => void
  children: React.ReactNode
}

const mousePositionNone = { x: NaN, y: NaN }

export interface SvgCoordinates {
  x: number
  y: number
}

export const MouseAwareSvg = ({ width, height, onMouseMove, children }: Props) => {
  const svgRoot = useRef<SVGSVGElement>(null)

  /**
   * Determines the coordinates of the mouse pointer in the coordinate system of the SVG root view port.
   * See http://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/
   */
  const mapMouseEvent = (event: React.MouseEvent): SvgCoordinates => {
    const ctm = svgRoot.current!.getScreenCTM()
    if (ctm) {
      return {
        x: (event.clientX - ctm.e) / ctm.a,
        y: (event.clientY - ctm.f) / ctm.d,
      }
    } else {
      return mousePositionNone
    }
  }

  const updateMousePosition = (e: React.MouseEvent) => onMouseMove(mapMouseEvent(e))
  const resetMousePosition = () => onMouseMove(mousePositionNone)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      ref={svgRoot}
      style={{ overflow: 'visible' }}
      onMouseEnter={updateMousePosition}
      onMouseMove={updateMousePosition}
      onMouseLeave={resetMousePosition}
    >
      <rect width={width} height={height} pointerEvents="all" fill="transparent"></rect>
      {children}
    </svg>
  )
}
