import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { group } from 'd3-array'

import { useTheme } from '@mui/material'

import { makeStyles } from '../../utils'

import { CustomLayerProps, TimelineEvent } from 'react-svg-timeline'

// import { useWorker } from '../../data/workers/hooks'

// import CreateVisibleEventsWorker from '../workers/create-visible-events?worker'
// import { VisibleEventsWorkerData, VisibleEventsWorkerResponse } from '../workers/create-visible-events'
import { RenderInfo, resizeCanvas } from './TimelineCanvasMarks'
import { TimelineEventWithPID } from '../containers/TimelineJourneys'

type Journey = ReadonlyArray<{ x: number; y: number }>

const useStyles = makeStyles()({
  layer: {
    width: '100%',
    height: '100%',
  },
})

interface TimelineJourneysProps<EID extends string, PatientId extends string, E extends TimelineEvent<EID, PatientId>>
  extends CustomLayerProps<EID, PatientId, E> {
  isPaneResizing: boolean
  isExpandedByPatientId: boolean
  eventsWithPID: ReadonlyArray<TimelineEventWithPID<any, any>>
  focusPatientId: PatientId
  indexPatientId: PatientId
}

export const TimelineJourneys = <
  EID extends string,
  PatientId extends string,
  E extends TimelineEvent<EID, PatientId>
>({
  height,
  width,
  xScale,
  laneDisplayMode,
  yScale,
  isExpandedByPatientId,
  eventsWithPID,
  focusPatientId,
  indexPatientId,
}: TimelineJourneysProps<EID, PatientId, E>) => {
  const { classes } = useStyles()
  const theme = useTheme()

  const [renderInfo, setRenderInfo] = useState<RenderInfo>()

  // TODO: Do this in a worker
  const patientJourneys: ReadonlyArray<Journey> = useMemo(() => {
    const patientJourneys: Journey[] = []

    const pidGroups = group(eventsWithPID, (event) => event.pid)

    // TODO: Render indexPatient journey with special color
    if (pidGroups && pidGroups.has(focusPatientId)) {
      patientJourneys.push(
        pidGroups
          .get(focusPatientId)
          ?.map((event) => ({ x: xScale(event.startTimeMillis), y: yScale(event.laneId) })) as Journey
      )
    }

    return patientJourneys
  }, [xScale, yScale, eventsWithPID, focusPatientId])

  // TODO: Share logic with marks layer
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

      ctx.strokeStyle = '#FF0000' // TODO: From theme
      ctx.lineWidth = 2

      const drawJourney = (journey: Journey) => {
        // Note: We could further optimize this, by
        // grouping events by color and then beginPath()ing
        // and filling/stroking only once per color.
        ctx.beginPath()
        journey.forEach((dot, index) => {
          if (index === 0) {
            ctx.moveTo(dot.x, dot.y)
          } else {
            ctx.lineTo(dot.x, dot.y)
          }
        })
        ctx.stroke()
        // ctx.closePath() - ctx.fill() automatically closes the path
      }

      // Draw visible events
      if (!isExpandedByPatientId && laneDisplayMode === 'expanded') {
        patientJourneys.forEach((journey) => drawJourney(journey))
      }
    }
  }, [renderInfo, width, height, patientJourneys, isExpandedByPatientId, laneDisplayMode])

  return (
    <foreignObject x="0" y="0" width={width} height={height}>
      <canvas ref={canvasRef} className={classes.layer}></canvas>
    </foreignObject>
  )
}
