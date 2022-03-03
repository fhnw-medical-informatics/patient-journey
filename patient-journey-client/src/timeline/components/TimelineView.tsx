import React, { useEffect, useState } from 'react'
import { PatientData } from '../../data/patients'
import { Timeline as SVGTimeline, LaneDisplayMode } from 'react-svg-timeline'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'
import { Events, Lanes, TimelineState } from '../timelineSlice'

interface TimelineProps {
  readonly data: PatientData
  dateFormat: (ms: number) => string
  laneDisplayMode: LaneDisplayMode
  timelineState: TimelineState
}

export const TimelineView = ({ data, dateFormat, laneDisplayMode, timelineState }: TimelineProps) => {
  const patients = data.allPatients
  const columns = data.columns
  const [rawEvents, setRawEvents] = useState<Events>([])
  const [lanes, setLanes] = useState<Lanes>([])

  useEffect(() => {
    let lanes: Lanes = []
    let rawEvents: Events = []

    if (timelineState.type === 'date of birth') {
      lanes.push({
        laneId: 'date of birth',
        label: 'Date Of Birth',
      })
      patients.forEach((patient) => {
        columns.forEach((column) => {
          if (column.name === 'Date Of Birth') {
            const dateOfBirth = patient.values[column.index].split('.')
            const date = new Date(Number(dateOfBirth[2]), Number(dateOfBirth[1]) - 1, Number(dateOfBirth[0]))
            const startTimeMillis = date.getTime()
            rawEvents.push({ eventId: patient.pid, laneId: timelineState.type, startTimeMillis: startTimeMillis })
          }
        })
      })
    } else {
      lanes.push({
        laneId: 'timestamp',
        label: 'Timestamp',
      })
      patients.forEach((patient) => {
        columns.forEach((column) => {
          if (column.name === 'Timestamp') {
            const startTimeMillis = Number(patient.values[column.index])
            rawEvents.push({ eventId: patient.pid, laneId: timelineState.type, startTimeMillis: startTimeMillis })
          }
        })
      })
    }
    setRawEvents(rawEvents)
    setLanes(lanes)
  }, [timelineState.type, patients, columns])

  return (
    <AutoSizer>
      {({ width, height }: Size) => {
        return (
          <SVGTimeline
            width={width}
            height={height}
            events={rawEvents}
            lanes={lanes}
            dateFormat={dateFormat}
            laneDisplayMode={laneDisplayMode}
            enableEventClustering={timelineState.cluster}
          />
        )
      }}
    </AutoSizer>
  )
}
