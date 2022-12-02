import { useEffect, useMemo } from 'react'
import { group } from 'd3-array'

import { useTheme } from '@mui/material'

import { makeStyles } from '../../utils'

import { CustomLayerProps, TimelineEvent } from 'react-svg-timeline'

// import { useWorker } from '../../data/workers/hooks'

// import CreateVisibleEventsWorker from '../workers/create-visible-events?worker'
// import { VisibleEventsWorkerData, VisibleEventsWorkerResponse } from '../workers/create-visible-events'
import { resizeCanvas, TimelineCanvasMarks } from './TimelineCanvasMarks'
import { TimelineEventWithPID } from '../model'
import { useCanvas } from '../hooks'
import { ColorByColumnFn } from '../../color/hooks'
import { Entity } from '../../data/entities'
import { createFocusColor } from '../../theme/useCustomTheme'

type Journey = {
  color: string
  events: ReadonlyArray<{ x: number; y: number }>
}

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
  hoveredPatientId: PatientId
  selectedPatientId: PatientId
  indexPatientId: PatientId
  colorByColumnFn: ColorByColumnFn
  patientMap: Map<PatientId, Entity>
}

export const TimelineJourneys = <EID extends string, PatientId extends string, E extends TimelineEvent<EID, PatientId>>(
  props: TimelineJourneysProps<EID, PatientId, E>
) => {
  const {
    height,
    width,
    xScale,
    laneDisplayMode,
    yScale,
    isExpandedByPatientId,
    eventsWithPID,
    hoveredPatientId,
    selectedPatientId,
    indexPatientId,
    colorByColumnFn,
    patientMap,
  } = props

  const { classes } = useStyles()
  const theme = useTheme()

  const { canvasRef, renderInfo } = useCanvas()

  // TODO: Do this in a worker
  const [patientJourneys, patientJourneysEvents] = useMemo(() => {
    const patientJourneys: Journey[] = []
    const patientJourneyEvents: TimelineEvent<EID, PatientId>[] = []

    const pidGroups = group(eventsWithPID, (event) => event.pid)

    const getJourneyForPID = (pid: PatientId, color: string): Journey => ({
      color,
      events:
        pidGroups.get(pid)?.map((event) => ({ x: xScale(event.startTimeMillis), y: yScale(event.laneId) ?? 0 })) ?? [],
    })

    const getEventsForPID = (pid: PatientId): TimelineEvent<EID, PatientId>[] => pidGroups.get(pid) ?? []

    // TODO: Render indexPatient journey with special color
    if (pidGroups && pidGroups.has(hoveredPatientId)) {
      const focusPatientColor =
        hoveredPatientId === selectedPatientId
          ? theme.entityColors.selected
          : colorByColumnFn(patientMap.get(hoveredPatientId) as Entity)

      const augmentedColor = createFocusColor(theme, focusPatientColor)

      patientJourneys.push(getJourneyForPID(hoveredPatientId, augmentedColor))
      patientJourneyEvents.push(...getEventsForPID(hoveredPatientId))
    }

    if (pidGroups && hoveredPatientId !== selectedPatientId && pidGroups.has(selectedPatientId)) {
      patientJourneys.push(getJourneyForPID(selectedPatientId, theme.entityColors.selected))
      patientJourneyEvents.push(...getEventsForPID(selectedPatientId))
    }

    if (pidGroups && pidGroups.has(indexPatientId)) {
      patientJourneys.push(getJourneyForPID(indexPatientId, theme.entityColors.indexPatient))
      patientJourneyEvents.push(...getEventsForPID(indexPatientId))
    }

    return [patientJourneys, patientJourneyEvents]
  }, [
    theme,
    xScale,
    yScale,
    eventsWithPID,
    hoveredPatientId,
    selectedPatientId,
    indexPatientId,
    colorByColumnFn,
    patientMap,
  ])

  // Draw the marks
  useEffect(() => {
    if (renderInfo) {
      const { ctx, canvas } = renderInfo

      resizeCanvas(canvas, ctx)

      ctx.clearRect(0, 0, width, height)

      ctx.lineWidth = 4

      const drawJourney = (journey: Journey) => {
        ctx.strokeStyle = journey.color
        ctx.beginPath()
        journey.events.forEach((dot, index) => {
          if (index === 0) {
            ctx.moveTo(dot.x, dot.y)
          } else {
            ctx.lineTo(dot.x, dot.y)
          }
        })
        ctx.stroke()
      }

      // Draw visible events
      if (!isExpandedByPatientId && laneDisplayMode === 'expanded') {
        patientJourneys.forEach((journey) => drawJourney(journey))
      }
    }
  }, [renderInfo, width, height, patientJourneys, isExpandedByPatientId, laneDisplayMode])

  return (
    <>
      <foreignObject x="0" y="0" width={width} height={height}>
        <canvas ref={canvasRef} className={classes.layer}></canvas>
      </foreignObject>
      {/* Draw only marks for journeys */}
      <TimelineCanvasMarks {...props} events={patientJourneysEvents} />
    </>
  )
}
