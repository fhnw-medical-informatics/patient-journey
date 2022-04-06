import { useTheme } from '@mui/material'
import { extent } from 'd3-array'
import { scaleSqrt } from 'd3-scale'
import React, { useCallback, useEffect, useState } from 'react'

import { CustomLayer, TimelineEvent } from 'react-svg-timeline'

type RenderInfo = { ctx: CanvasRenderingContext2D }

const defaultSingleEventMarkHeight = 20

export const TimelineCanvasMarks: CustomLayer = ({
  height,
  width,
  events,
  xScale,
  laneDisplayMode,
  yScale,
  eventClusters,
}) => {
  const theme = useTheme()

  const [renderInfo, setRenderInfo] = useState<RenderInfo>()

  const canvasRef = useCallback(
    (canvasElement: HTMLCanvasElement) => {
      if (canvasElement) {
        const ctx = canvasElement.getContext('2d')
        if (ctx) {
          const renderInfo = {
            ctx,
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
      const { ctx } = renderInfo

      ctx.clearRect(0, 0, width, height)

      ctx.strokeStyle = theme.palette.text.primary

      // Draw Clusters
      const [clusterSizeDomainMin, clusterSizeDomainMax] = extent(eventClusters.map((c) => c.size))
      const clusterRadiusMin = defaultSingleEventMarkHeight / 2

      const clusterRadiusMax =
        laneDisplayMode === 'expanded'
          ? yScale.bandwidth() / 1.2
          : Math.min(height / 2, 2 * defaultSingleEventMarkHeight)

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
        ctx.arc(x, y, defaultSingleEventMarkHeight / 2, 0, 360)
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
      <canvas ref={canvasRef} width={width} height={height}></canvas>
    </foreignObject>
  )
}
