import React from 'react'
import { PatientData } from '../../data/patients'
import { Timeline as SVGTimeline, LaneDisplayMode } from 'react-svg-timeline'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'

interface TimelineProps {
  readonly data: PatientData
  dateFormat: (ms: number) => string
  laneDisplayMode: LaneDisplayMode
}

export const TimelineView = ({ data, dateFormat, laneDisplayMode }: TimelineProps) => {
  const patients = data.allPatients
  const columns = data.columns
  let rawEvents: (
    | {
        eventId: string
        startTimeMillis: number
        laneId: string
        endTimeMillis?: undefined
      }
    | {
        eventId: string
        startTimeMillis: number
        endTimeMillis: number
        laneId: string
      }
  )[] = []

  patients.forEach((patient) => {
    console.log(patient)
    columns.forEach((column) => {
      if (column.name === 'Timestamp') {
        const startTimeMillis = Number(patient.values[column.index])
        rawEvents.push({ eventId: patient.pid, laneId: 'timestamp', startTimeMillis: startTimeMillis })
      }
    })
  })

  console.log(rawEvents)

  //const { lanes, events } = datasetJSON

  const lanes = [
    {
      laneId: 'timestamp',
      label: 'Timestamp',
    },
  ]

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
          />
        )
      }}
    </AutoSizer>
  )
}
