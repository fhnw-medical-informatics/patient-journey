import { useTheme } from '@mui/material'
import { extent } from 'd3-array'
import { scaleSqrt } from 'd3-scale'
import React, { useCallback, useEffect, useState } from 'react'

import { CustomLayer, TimelineEvent } from 'react-svg-timeline'

type RenderInfo = { ctx: CanvasRenderingContext2D; canvasElement: HTMLCanvasElement }

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
            canvasElement,
          }
          setRenderInfo(renderInfo)
        }
      }
    },
    [setRenderInfo]
  )

  useEffect(() => {
    if (renderInfo) {
      const { ctx } = renderInfo

      ctx.clearRect(0, 0, width, height)

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
        const x = xScale(cluster.timeMillis)

        ctx.fillStyle = theme.palette.primary.main
        ctx.strokeStyle = theme.palette.text.primary
        ctx.beginPath()
        ctx.arc(
          x,
          laneDisplayMode === 'collapsed' ? height / 2 : yScale(cluster.laneId!)!,
          clusterScale(cluster.size),
          0,
          360
        )
        ctx.fill()
        ctx.stroke()
        ctx.closePath()
      })

      // Draw Events

      const drawEvent = <EID extends string, E extends TimelineEvent<EID, any>>(event: E) => {
        const x = xScale(event.startTimeMillis)

        ctx.fillStyle = event.color ?? theme.palette.primary.main
        ctx.strokeStyle = theme.palette.text.primary

        ctx.beginPath()
        ctx.arc(
          x,
          laneDisplayMode === 'collapsed' ? height / 2 : yScale(event.laneId!)!,
          defaultSingleEventMarkHeight / 2,
          0,
          360
        )
        ctx.fill()
        ctx.stroke()
        ctx.closePath()
      }

      // Draw events
      events.forEach(drawEvent)
      // Draw selected and pinned events on top
      events.filter((event) => event.isSelected || event.isPinned).forEach(drawEvent)
    }
  }, [renderInfo, events, xScale, width, height, yScale, laneDisplayMode, eventClusters, theme])

  useEffect(() => {
    if (renderInfo) {
    }
  }, [renderInfo, eventClusters, xScale, yScale, laneDisplayMode, height])

  return (
    <foreignObject x="0" y="0" width={width} height={height}>
      <div style={{ height: '100%', width: '100%' }}>
        <canvas ref={canvasRef} id="event-marks-canvas" width={width} height={height}></canvas>
      </div>
    </foreignObject>
  )
}
