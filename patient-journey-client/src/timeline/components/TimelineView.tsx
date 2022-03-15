import React, { useEffect, useState } from 'react'
import { PatientData } from '../../data/patients'
import { Timeline as SVGTimeline, LaneDisplayMode } from 'react-svg-timeline'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'
import { Events, Lanes, TimelineColumn, TimelineState } from '../timelineSlice'
import { useFilteredPatientData } from '../../data/hooks'
import { EventData } from '../../data/events'

interface TimelineProps {
  readonly data: PatientData | EventData
  dateFormat: (ms: number) => string
  laneDisplayMode: LaneDisplayMode
  timelineState: TimelineState
  availableColumns: ReadonlyArray<TimelineColumn>
}

export const TimelineView = ({ data, dateFormat, laneDisplayMode, timelineState, availableColumns }: TimelineProps) => {
  const patients = useFilteredPatientData().allPatients

  const timelineData = data.type === 'patients' ? data.allPatients : data.allEvents

  const [rawEvents, setRawEvents] = useState<Events>([])
  const [lanes, setLanes] = useState<Lanes>([])
  //const [groupedRawEvents, setGroupedRawEvents] = useState<Events>([])
  //const [groupedLanes, setGroupedLanes] = useState<Lanes>([])

  useEffect(() => {
    let lanes: Lanes = []
    let rawEvents: Events = []
    //let groupedLanes: Lanes = []
    //let groupedRawEvents: Events = []

    let activeColumn: TimelineColumn | undefined = availableColumns.find((column) =>
      column.type === 'timestamp' ? column : undefined
    )

    timelineData.forEach((lane) => {
      lanes.push({
        laneId: lane.pid,
        label: lane.values[1] + ' ' + lane.values[2],
      })
      rawEvents.push({
        eventId: lane.pid,
        laneId: lane.pid,
        startTimeMillis: Number(lane.values[activeColumn ? activeColumn.index : 0]),
      })
    })

    /* patients.forEach((patient) => {
      lanes.push({
        laneId: patient.pid,
        label: patient.values[1] + ' ' + patient.values[2],
      })
      columns.forEach((column) => {
        const startTimeMillis = Number(patient.values[column.index])
        groupedRawEvents.push({
          eventId: patient.pid,
          laneId: availableColumns[timelineState.column].name,
          startTimeMillis: startTimeMillis,
        })
        rawEvents.push({
          eventId: patient.pid,
          laneId: timelineState.grouping ? availableColumns[timelineState.column].name : patient.pid,
          startTimeMillis: startTimeMillis,
        })
      })
    }) */

    setRawEvents(rawEvents)
    setLanes(lanes)
    //setGroupedRawEvents(groupedRawEvents)
    //setGroupedLanes(groupedLanes)
  }, [timelineState.column, timelineState.grouping, patients, availableColumns, timelineData])

  if (!rawEvents || rawEvents.length === 0) {
    return null
  }

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
