import React, { useEffect, useState } from 'react'
import { PatientData } from '../../data/patients'
import { Timeline as SVGTimeline, LaneDisplayMode } from 'react-svg-timeline'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'
import { Events, Lanes, TimelineColumn, TimelineState } from '../timelineSlice'
import { useFilteredPatientData } from '../../data/hooks'
import { EventData } from '../../data/events'
import { stringToMillis } from '../../data/columns'

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
  const [groupedRawEvents, setGroupedRawEvents] = useState<Events>([])
  const [groupedLanes, setGroupedLanes] = useState<Lanes>([])

  useEffect(() => {
    let lanes: Lanes = []
    let rawEvents: Events = []
    let groupedLanes: Lanes = []
    let groupedRawEvents: Events = []

    let activeColumn: TimelineColumn | undefined = timelineState.column
      ? availableColumns[timelineState.column.index]
      : undefined

    if (timelineState.column !== undefined) {
      groupedLanes.push({
        laneId: activeColumn ? String(activeColumn.index) : '',
        label: activeColumn ? activeColumn.name : '',
      })

      timelineData.forEach((lane) => {
        lanes.push({
          laneId: lane.pid,
          label: lane.values[1] + ' ' + lane.values[2],
        })
        rawEvents.push({
          eventId: lane.pid,
          laneId: lane.pid,
          startTimeMillis:
            activeColumn?.type === 'date'
              ? stringToMillis(lane.values[activeColumn ? activeColumn.index : 0])
              : Number(lane.values[activeColumn ? activeColumn.index : 0]),
        })
        groupedRawEvents.push({
          eventId: lane.pid,
          laneId: activeColumn ? String(activeColumn.index) : '',
          startTimeMillis:
            activeColumn?.type === 'date'
              ? stringToMillis(lane.values[activeColumn ? activeColumn.index : 0])
              : Number(lane.values[activeColumn ? activeColumn.index : 0]),
        })
      })
    }

    setRawEvents(rawEvents)
    setLanes(lanes)
    setGroupedRawEvents(groupedRawEvents)
    setGroupedLanes(groupedLanes)
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
            events={timelineState.grouping ? groupedRawEvents : rawEvents}
            lanes={timelineState.grouping ? groupedLanes : lanes}
            dateFormat={dateFormat}
            laneDisplayMode={laneDisplayMode}
            enableEventClustering={timelineState.cluster}
          />
        )
      }}
    </AutoSizer>
  )
}
