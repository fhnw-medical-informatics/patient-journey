import React, { useCallback, useDeferredValue, useEffect, useState } from 'react'

import { useTheme } from '@mui/material'

import { extent, groups } from 'd3-array'
import { scaleSqrt } from 'd3-scale'

import { makeStyles } from '../../utils'

import { CustomLayer, CustomLayerProps, TimelineEvent } from 'react-svg-timeline'
import { calcMarkSize } from './SvgMark'

type RenderInfo = { ctx: CanvasRenderingContext2D; canvas: HTMLCanvasElement }

type Coordinates = { x: number; y: number }

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
  isAnimationInProgress,
}: CustomLayerProps<EID, PatientId, E>) => {
  const { classes } = useStyles()
  const theme = useTheme()

  const [visibleEventsWithCoordinates, setVisibleEventsWithCoordinates] = useState<
    ReadonlyArray<Pick<E, 'color' | 'startTimeMillis' | 'laneId'> & Coordinates>
  >([])
  const [pinnedEventsWithCoordinates, setPinnedEventsWithCoordinates] = useState<ReadonlyArray<E & Coordinates>>([])

  // Use deferred values to ensure user interaction has priority
  // when changen pane size or zooming.
  const deferredEvents = useDeferredValue(events)
  const deferredClusters = useDeferredValue(eventClusters)
  const deferredHeight = useDeferredValue(height)
  const deferredWidth = useDeferredValue(width)
  const deferredYScale = useDeferredValue(yScale)
  const deferredXScale = useDeferredValue(xScale)

  // TODO: This is a workaround for the way animations work
  // in react-svg-timeline (each animation fram is a state change)
  // once re-factored, the code below can be simplified.
  useEffect(() => {
    const getCoordinates = (e: Pick<E, 'color' | 'startTimeMillis' | 'laneId'>): Coordinates => {
      return {
        x: Math.floor(deferredXScale(e.startTimeMillis)),
        y: Math.floor(laneDisplayMode === 'collapsed' ? deferredHeight / 2 : deferredYScale(e.laneId!)!),
      }
    }

    if (!isAnimationInProgress) {
      // Process all events when no animation is in progress

      // Get current coordinates for all events
      const eventsWithCoordinates = deferredEvents.map((e) => ({
        ...e,
        ...getCoordinates(e),
      }))

      // Get current coordinates for all pinned/selected events
      const pinnedEventsWithCoordinates = eventsWithCoordinates.filter((event) => event.isSelected || event.isPinned)

      // Group events by coordinates (events that would be painted on top of each other,
      // share the same coordinates and fall into the same group)
      const eventsGroupedByCoordinates = groups(
        eventsWithCoordinates,
        (e) => e.y,
        (e) => e.x
      )

      // Reduce the events to only visible events (1 event representing each coordinate group)
      const visibleEventsWithCoordinates = eventsGroupedByCoordinates.reduce((accLanes, curLane) => {
        const y = curLane[0]

        const newLanes = []

        for (let i = 0; i < curLane[1].length; i++) {
          const x = curLane[1][i][0]
          const firstEventInGroup = curLane[1][i][1][0]

          newLanes.push({
            x,
            y,
            color: firstEventInGroup.color,
            startTimeMillis: firstEventInGroup.startTimeMillis,
            laneId: firstEventInGroup.laneId,
          })
        }

        return [...accLanes, ...newLanes]
      }, [] as ReadonlyArray<Pick<E, 'color' | 'startTimeMillis' | 'laneId'> & Coordinates>)

      setVisibleEventsWithCoordinates(visibleEventsWithCoordinates)
      setPinnedEventsWithCoordinates(pinnedEventsWithCoordinates)
    } else {
      // Only update currently visible (previously processed) events when animation is in progress
      setVisibleEventsWithCoordinates((events) => events.map((e) => ({ ...e, ...getCoordinates(e) })))
      setPinnedEventsWithCoordinates((events) => events.map((e) => ({ ...e, ...getCoordinates(e) })))
    }
  }, [deferredEvents, deferredHeight, laneDisplayMode, deferredXScale, deferredYScale, isAnimationInProgress])

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

      ctx.clearRect(0, 0, deferredWidth, deferredHeight)

      ctx.strokeStyle = theme.palette.background.paper
      ctx.lineWidth = 2

      // Draw Clusters
      const [clusterSizeDomainMin, clusterSizeDomainMax] = extent(deferredClusters.map((c) => c.size))
      const markSize = calcMarkSize(laneDisplayMode, deferredYScale.bandwidth())
      const clusterRadiusMin = markSize / 2
      const clusterRadiusMax = laneDisplayMode === 'expanded' ? markSize : Math.min(deferredHeight / 2, 2 * markSize)

      const clusterScale = scaleSqrt()
        .domain([clusterSizeDomainMin ?? 0, clusterSizeDomainMax ?? 0])
        .range([clusterRadiusMin, clusterRadiusMax])

      deferredClusters.forEach((cluster) => {
        // Round to avoid sub-pixel rendering
        const x = Math.round(deferredXScale(cluster.timeMillis))
        const y = Math.round(laneDisplayMode === 'collapsed' ? deferredHeight / 2 : deferredYScale(cluster.laneId!)!)

        changeCanvasFillStyle(ctx, theme.palette.primary.main)

        ctx.beginPath()
        ctx.arc(x, y, clusterScale(cluster.size), 0, 360)
        ctx.fill()
        ctx.stroke()
        // ctx.closePath() - ctx.fill() automatically closes the path
      })

      const drawVisibleEvents = (visibleEvent: { x: number; y: number; color?: string }) => {
        changeCanvasFillStyle(ctx, visibleEvent.color ?? theme.palette.primary.main)

        // Note: We could further optimize this, by
        // grouping events by color and then beginPath()ing
        // and filling/stroking only once per color.
        ctx.beginPath()
        ctx.arc(visibleEvent.x, visibleEvent.y, markSize / 2, 0, 360)
        ctx.fill()
        ctx.stroke()
        // ctx.closePath() - ctx.fill() automatically closes the path
      }

      // Draw visible events
      visibleEventsWithCoordinates.forEach((event) => drawVisibleEvents({ x: event.x, y: event.y, color: event.color }))
      // Draw selected and pinned events on top
      pinnedEventsWithCoordinates.forEach((event) => drawVisibleEvents({ x: event.x, y: event.y, color: event.color }))
    }
  }, [
    renderInfo,
    pinnedEventsWithCoordinates,
    visibleEventsWithCoordinates,
    deferredXScale,
    deferredWidth,
    deferredHeight,
    deferredYScale,
    laneDisplayMode,
    deferredClusters,
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
