import React, { useEffect, useState } from 'react'
import { PatientData } from '../../data/patients'
import { Timeline as SVGTimeline, LaneDisplayMode } from 'react-svg-timeline'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'
import { Events, Lanes, TimelineState } from '../timelineSlice'
import { useFilteredPatientData } from '../../data/hooks'

interface TimelineProps {
  readonly data: PatientData
  dateFormat: (ms: number) => string
  laneDisplayMode: LaneDisplayMode
  timelineState: TimelineState
}

export const TimelineView = ({ data, dateFormat, laneDisplayMode, timelineState }: TimelineProps) => {
  const patients = useFilteredPatientData().allPatients

  const columns = data.columns
  const [rawEvents, setRawEvents] = useState<Events>([])
  const [lanes, setLanes] = useState<Lanes>([])
  /* const [groupedRawEvents, setGroupedRawEvents] = useState<Events>([])
  const [groupedlanes, setGroupedLanes] = useState<Lanes>([]) */

  useEffect(() => {
    let lanes: Lanes = []
    let rawEvents: Events = []

    if (timelineState.type === 'date of birth') {
      if (timelineState.grouping) {
        lanes.push({
          laneId: 'date of birth',
          label: 'Date Of Birth',
        })
      }
      patients.forEach((patient) => {
        if (!timelineState.grouping) {
          lanes.push({
            laneId: patient.pid,
            label: patient.values[1] + ' ' + patient.values[2],
          })
        }
        columns.forEach((column) => {
          if (column.name === 'Date Of Birth') {
            const dateOfBirth = patient.values[column.index].split('.')
            const date = new Date(Number(dateOfBirth[2]), Number(dateOfBirth[1]) - 1, Number(dateOfBirth[0]))
            const startTimeMillis = date.getTime()
            rawEvents.push({
              eventId: patient.pid,
              laneId: timelineState.grouping ? timelineState.type : patient.pid,
              startTimeMillis: startTimeMillis,
            })
          }
        })
      })
    } else {
      if (timelineState.grouping) {
        lanes.push({
          laneId: 'timestamp',
          label: 'Timestamp',
        })
      }
      patients.forEach((patient) => {
        if (!timelineState.grouping) {
          lanes.push({
            laneId: patient.pid,
            label: patient.values[1] + ' ' + patient.values[2],
          })
        }
        columns.forEach((column) => {
          if (column.name === 'Timestamp') {
            const startTimeMillis = Number(patient.values[column.index])
            rawEvents.push({
              eventId: patient.pid,
              laneId: timelineState.grouping ? timelineState.type : patient.pid,
              startTimeMillis: startTimeMillis,
            })
          }
        })
      })
    }
    setRawEvents(rawEvents)
    setLanes(lanes)
  }, [timelineState.type, timelineState.grouping, patients, columns])

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
