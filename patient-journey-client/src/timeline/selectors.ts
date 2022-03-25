import { createSelector } from '@reduxjs/toolkit'
import { TimelineEvent, TimelineLane } from 'react-svg-timeline'
import { stringToMillis } from '../data/columns'
import { Entity } from '../data/entities'
import { PatientId } from '../data/patients'
import { selectActiveDataColumns, selectFilteredActiveData } from '../data/selectors'
import { RootState } from '../store'
import { TimelineColumn, TimelineColumnNone, TimelineState } from './timelineSlice'

export const selectTimelineState = (s: RootState): TimelineState => s.timeline

const selectTimelineColumn = (s: RootState): TimelineColumn => s.timeline.column

export const selectFilteredActiveDataAsEvents = createSelector(
  selectTimelineColumn,
  selectActiveDataColumns,
  selectFilteredActiveData,
  (timelineColumn, activeColumns, activeData) =>
    timelineColumn !== TimelineColumnNone &&
    activeColumns.findIndex(
      (column) => column.name === timelineColumn.name && column.index === timelineColumn.index
    ) !== -1
      ? (activeData.map((event, idx) => ({
          eventId: event.uid,
          laneId: event.pid,
          startTimeMillis:
            timelineColumn.type === 'date'
              ? stringToMillis(event.values[timelineColumn.index])
              : +event.values[timelineColumn.index],
        })) as ReadonlyArray<TimelineEvent<PatientId, PatientId>>)
      : []
)

export const selectFilteredActiveDataAsLanes = createSelector(
  selectFilteredActiveData,
  (activeData) =>
    Array.from(new Set((activeData as ReadonlyArray<Entity & { pid: PatientId }>).map((event) => event.pid))).map(
      (pid) => ({
        laneId: pid,
        label: pid, // TODO: Proper label
      })
    ) as ReadonlyArray<TimelineLane<PatientId>>
)
