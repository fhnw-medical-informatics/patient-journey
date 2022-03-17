import { createSelector } from '@reduxjs/toolkit'
import { TimelineEvent, TimelineLane } from 'react-svg-timeline'
import { stringToMillis } from '../data/columns'
import { PatientJourneyEvent } from '../data/events'
import { PatientId } from '../data/patients'
import { selectFilteredActiveData } from '../data/selectors'
import { RootState } from '../store'
import { TimelineColumn, TimelineColumnNone, TimelineState } from './timelineSlice'

export const selectTimelineState = (s: RootState): TimelineState => s.timeline

const selectTimelineColumn = (s: RootState): TimelineColumn => s.timeline.column

export const selectFilteredActiveDataAsEvents = createSelector(
  selectTimelineColumn,
  selectFilteredActiveData,
  (timelineColumn, activeData) =>
    timelineColumn !== TimelineColumnNone &&
    activeData.columns.findIndex(
      (column) => column.name === timelineColumn.name && column.index === timelineColumn.index
    ) !== -1
      ? ((activeData.type === 'patients' ? activeData.allPatients : activeData.allEvents).map((event) => ({
          eventId: activeData.type === 'patients' ? event.pid : (event as PatientJourneyEvent).eid,
          laneId: event.pid,
          startTimeMillis:
            timelineColumn.type === 'date'
              ? stringToMillis(event.values[timelineColumn.index])
              : +event.values[timelineColumn.index],
        })) as ReadonlyArray<TimelineEvent<PatientId, PatientId>>)
      : []
)

export const selectFilteredActiveDataAsLanes = createSelector(selectFilteredActiveData, (activeData) =>
  (activeData.type === 'patients' ? activeData.allPatients : activeData.allEvents).reduce((timelineLanes, event) => {
    return timelineLanes.findIndex((lane) => lane.laneId === event.pid) >= 0
      ? timelineLanes
      : [
          ...timelineLanes,
          {
            laneId: event.pid,
            label: event.pid, // TODO: Proper label
          },
        ]
  }, [] as ReadonlyArray<TimelineLane<PatientId>>)
)
