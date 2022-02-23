import React from 'react'
import { PatientData } from '../../data/dataSlice'
import { Timeline as SVGTimeline, LaneDisplayMode } from 'react-svg-timeline'
import datasetJSON from './dataset.json'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'

interface TimelineProps {
  readonly data: PatientData
  dateFormat: (ms: number) => string
  laneDisplayMode: LaneDisplayMode
}

export const TimelineView = ({ data, dateFormat, laneDisplayMode }: TimelineProps) => {
  const patients = data.allPatients
  const columns = data.columns

  const events2 = patients.map((patient) => {
    console.log(patient)
    return columns.map((column) => {
      if (column.name === 'Timestamp') {
        return { eventId: patient.id, startTimeMillis: patient.values[column.index] }
      } else {
        return null
      }
    })
  })

  console.log(events2)

  const { lanes, events } = datasetJSON

  return (
    <AutoSizer>
      {({ width, height }: Size) => {
        return (
          <SVGTimeline
            width={width}
            height={height}
            events={events}
            lanes={lanes}
            dateFormat={dateFormat}
            laneDisplayMode={laneDisplayMode}
          />
        )
      }}
    </AutoSizer>
  )
}
