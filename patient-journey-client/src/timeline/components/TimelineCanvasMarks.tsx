import React, { useCallback, useEffect, useState } from 'react'

import { useTheme } from '@mui/material'

import { extent } from 'd3-array'
import { scaleSqrt } from 'd3-scale'

import { makeStyles } from '../../utils'

import { CustomLayer, TimelineEvent } from 'react-svg-timeline'
import { TIMELINE_MARK_SIZE } from './SvgMark'

type RenderInfo = { ctx: CanvasRenderingContext2D; canvas: HTMLCanvasElement }

const useStyles = makeStyles()((theme) => ({
  layer: {
    width: '100%',
    height: '100%',
  },
}))

export const TimelineCanvasMarks: CustomLayer = ({
  height,
  width,
  events,
  xScale,
  laneDisplayMode,
  yScale,
  eventClusters,
}) => {
  const { classes } = useStyles()
  const theme = useTheme()

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

      ctx.strokeStyle = theme.palette.text.primary

      // Draw Clusters
      const [clusterSizeDomainMin, clusterSizeDomainMax] = extent(eventClusters.map((c) => c.size))
      const clusterRadiusMin = TIMELINE_MARK_SIZE / 2

      const clusterRadiusMax =
        laneDisplayMode === 'expanded' ? yScale.bandwidth() / 1.2 : Math.min(height / 2, 2 * TIMELINE_MARK_SIZE)

      const clusterScale = scaleSqrt()
        .domain([clusterSizeDomainMin ?? 0, clusterSizeDomainMax ?? 0])
        .range([clusterRadiusMin, clusterRadiusMax])

      eventClusters.forEach((cluster) => {
        // Round to avoid sub-pixel rendering
        const x = Math.round(xScale(cluster.timeMillis))
        const y = Math.round(laneDisplayMode === 'collapsed' ? height / 2 : yScale(cluster.laneId!)!)

        ctx.fillStyle = theme.palette.primary.main
        ctx.beginPath()
        ctx.arc(x, y, clusterScale(cluster.size), 0, 360)
        ctx.fill()
        ctx.stroke()
        // ctx.closePath() - ctx.fill() automatically closes the path
      })

      // Draw Events
      const drawEvent = <EID extends string, E extends TimelineEvent<EID, any>>(event: E) => {
        // Round to avoid sub-pixel rendering
        const x = Math.round(xScale(event.startTimeMillis))
        const y = Math.round(laneDisplayMode === 'collapsed' ? height / 2 : yScale(event.laneId!)!)

        ctx.fillStyle = event.color ?? theme.palette.primary.main

        // Note: We could further optimize this, by
        // grouping events by color and then beginPath()ing
        // and filling/stroking only once per color.
        ctx.beginPath()
        ctx.arc(x, y, TIMELINE_MARK_SIZE / 2, 0, 360)
        ctx.fill()
        ctx.stroke()
        // ctx.closePath() - ctx.fill() automatically closes the path
      }

      // Draw events
      events.forEach(drawEvent)
      // Draw selected and pinned events on top
      events.filter((event) => event.isSelected || event.isPinned).forEach(drawEvent)
    }
  }, [renderInfo, events, xScale, width, height, yScale, laneDisplayMode, eventClusters, theme])

  return (
    <foreignObject x="0" y="0" width={width} height={height}>
      <canvas ref={canvasRef} width={width} height={height} className={classes.layer}></canvas>
    </foreignObject>
  )
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
