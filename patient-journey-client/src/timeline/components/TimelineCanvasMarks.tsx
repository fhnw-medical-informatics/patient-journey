import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useTheme } from '@mui/material'

import { extent, groups } from 'd3-array'
import { scaleSqrt } from 'd3-scale'

import { makeStyles } from '../../utils'

import { CustomLayer, CustomLayerProps, TimelineEvent } from 'react-svg-timeline'
import { calcMarkSize } from './SvgMark'

type RenderInfo = { ctx: CanvasRenderingContext2D; canvas: HTMLCanvasElement }

const useStyles = makeStyles()({
  layer: {
    width: '100%',
    height: '100%',
  },
})

const TimelineCanvasMarks = <EID extends string, PatientId extends string, E extends TimelineEvent<EID, PatientId>>({
  height,
  width,
  events,
  xScale,
  laneDisplayMode,
  yScale,
  eventClusters,
}: CustomLayerProps<EID, PatientId, E>) => {
  const { classes } = useStyles()
  const theme = useTheme()

  // TODO: Effective memoization
  const eventsWithCoordinates = useMemo(
    () =>
      events.map((e) => ({
        ...e,
        x: Math.floor(xScale(e.startTimeMillis)),
        y: Math.floor(laneDisplayMode === 'collapsed' ? height / 2 : yScale(e.laneId!)!),
      })),
    [events, height, laneDisplayMode, xScale, yScale]
  )

  const pinnedEventsWithCoordinates = useMemo(
    () => eventsWithCoordinates.filter((event) => event.isSelected || event.isPinned),
    [eventsWithCoordinates]
  )

  const eventsGroupedByCoordinates = useMemo(
    () =>
      groups(
        eventsWithCoordinates,
        (e) => e.y,
        (e) => e.x
      ),
    [eventsWithCoordinates]
  )

  const [renderInfo, setRenderInfo] = useState<RenderInfo>()

  const canvasRef = useCallback(
    (canvasElement: HTMLCanvasElement) => {
      if (canvasElement) {
        const ctx = canvasElement.getContext('2d')
        if (ctx) {
          const renderInfo = {
            ctx,
            canvas: canvasElement,
          }
          setRenderInfo(renderInfo)
        }
      }
    },
    [setRenderInfo]
  )

  // Draw the marks
  useEffect(() => {
    if (renderInfo) {
      const { ctx, canvas } = renderInfo

      resizeCanvas(canvas, ctx)

      ctx.clearRect(0, 0, width, height)

      ctx.strokeStyle = theme.palette.background.paper
      ctx.lineWidth = 2

      // Draw Clusters
      const [clusterSizeDomainMin, clusterSizeDomainMax] = extent(eventClusters.map((c) => c.size))
      const markSize = calcMarkSize(laneDisplayMode, yScale.bandwidth())
      const clusterRadiusMin = markSize / 2
      const clusterRadiusMax = laneDisplayMode === 'expanded' ? markSize : Math.min(height / 2, 2 * markSize)

      const clusterScale = scaleSqrt()
        .domain([clusterSizeDomainMin ?? 0, clusterSizeDomainMax ?? 0])
        .range([clusterRadiusMin, clusterRadiusMax])

      eventClusters.forEach((cluster) => {
        // Round to avoid sub-pixel rendering
        const x = Math.round(xScale(cluster.timeMillis))
        const y = Math.round(laneDisplayMode === 'collapsed' ? height / 2 : yScale(cluster.laneId!)!)

        changeCanvasFillStyle(ctx, theme.palette.primary.main)

        ctx.beginPath()
        ctx.arc(x, y, clusterScale(cluster.size), 0, 360)
        ctx.fill()
        ctx.stroke()
        // ctx.closePath() - ctx.fill() automatically closes the path
      })

      const drawGroup = (group: { x: number; y: number; color?: string }) => {
        changeCanvasFillStyle(ctx, group.color ?? theme.palette.primary.main)

        // Note: We could further optimize this, by
        // grouping events by color and then beginPath()ing
        // and filling/stroking only once per color.
        ctx.beginPath()
        ctx.arc(group.x, group.y, markSize / 2, 0, 360)
        ctx.fill()
        ctx.stroke()
        // ctx.closePath() - ctx.fill() automatically closes the path
      }

      // Draw visible events
      eventsGroupedByCoordinates.forEach((lane) => {
        const y = lane[0]

        for (let i = 0; i < lane[1].length; i++) {
          const x = lane[1][i][0]
          const firstEventInGroup = lane[1][i][1][0]

          drawGroup({ x, y, color: firstEventInGroup.color })
        }
      })
      // Draw selected and pinned events on top
      pinnedEventsWithCoordinates.forEach((event) => drawGroup({ x: event.x, y: event.y, color: event.color }))
    }
  }, [
    renderInfo,
    pinnedEventsWithCoordinates,
    eventsGroupedByCoordinates,
    xScale,
    width,
    height,
    yScale,
    laneDisplayMode,
    eventClusters,
    theme,
  ])

  return (
    <foreignObject x="0" y="0" width={width} height={height}>
      <canvas ref={canvasRef} className={classes.layer}></canvas>
    </foreignObject>
  )
}

// A passthrough component is needed to prevent the whole timeline from re-rendering
// when the components hooks change.
export const TimelineCanvasMarksLayer: CustomLayer = (props) => {
  return <TimelineCanvasMarks {...props} />
}

export function resizeCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
  // Lookup the size at which the browser is displaying the canvas.
  const dpr = window.devicePixelRatio || 1

  const displayWidth = canvas.clientWidth * dpr
  const displayHeight = canvas.clientHeight * dpr

  // Check if the canvas is not the same size.
  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    console.log(
      `Resizing canvas from ${canvas.width} x ${canvas.height} to ${displayWidth} x ${displayHeight} (${dpr} dpr)`
    )
    // Make the canvas the same size
    canvas.width = displayWidth
    canvas.height = displayHeight

    ctx.scale(dpr, dpr)
  }
}

// Canvas state changes are expensive, only change if needed
function changeCanvasFillStyle(ctx: CanvasRenderingContext2D, color: string): void {
  if (ctx.fillStyle !== color) {
    ctx.fillStyle = color
  }
}
