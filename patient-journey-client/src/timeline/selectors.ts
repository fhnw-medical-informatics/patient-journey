import { createSelector } from '@reduxjs/toolkit'
import { TimelineEvent, TimelineLane } from 'react-svg-timeline'
import { ColorByCategoryFn, ColorByColumnFn } from '../color/useColor'
import { stringToMillis } from '../data/columns'
import { Entity, EntityId } from '../data/entities'
import { EventDataColumn, PatientJourneyEvent } from '../data/events'
import { Patient, PatientDataColumn, PatientId } from '../data/patients'
import {
  selectActiveDataColumns,
  selectFilteredActiveData,
  selectActiveHoveredEntity,
  selectActiveSelectedEntity,
} from '../data/selectors'
import { RootState } from '../store'
import { CursorPosition, TimelineColumn, TimelineColumnNone } from './timelineSlice'

export const selectTimelineCluster = (s: RootState): boolean => s.timeline.cluster

export const selectViewByColumn = (s: RootState): TimelineColumn => s.timeline.viewByColumn

export const selectExpandByColumn = (s: RootState): TimelineColumn => s.timeline.expandByColumn

// https://redux.js.org/usage/deriving-data-selectors#createselector-behavior
const selectColorByColumnFn = (s: RootState, colorByColumnFn: ColorByColumnFn): ColorByColumnFn => colorByColumnFn

const convertEntityToTimelineEvent = (
  viewByColumn: TimelineColumn,
  expandByColumn: TimelineColumn,
  activeColumns: ReadonlyArray<PatientDataColumn | EventDataColumn>,
  activeData: ReadonlyArray<Patient | PatientJourneyEvent>,
  colorByColumnFn?: ColorByColumnFn
) => {
  return viewByColumn !== TimelineColumnNone &&
    activeColumns.findIndex((column) => column.name === viewByColumn.name && column.index === viewByColumn.index) !== -1
    ? (activeData.map((event) => ({
        eventId: event.uid,
        laneId: expandByColumn === TimelineColumnNone ? event.pid : event.values[expandByColumn.index],
        isPinned: false,
        color: colorByColumnFn ? colorByColumnFn(event) : undefined,
        startTimeMillis:
          viewByColumn.type === 'date'
            ? stringToMillis(event.values[viewByColumn.index])
            : +event.values[viewByColumn.index],
      })) as ReadonlyArray<TimelineEvent<EntityId, any>>)
    : []
}

export const selectFilteredActiveDataAsEvents = createSelector(
  selectViewByColumn,
  selectExpandByColumn,
  selectActiveDataColumns,
  selectFilteredActiveData,
  selectColorByColumnFn,
  (viewByColumn, expandByColumn, activeColumns, activeData, colorByColumnFn) =>
    convertEntityToTimelineEvent(viewByColumn, expandByColumn, activeColumns, activeData, colorByColumnFn)
)

export const selectFilteredActiveDataAsEventsWithoutColor = createSelector(
  selectViewByColumn,
  selectExpandByColumn,
  selectActiveDataColumns,
  selectFilteredActiveData,
  (viewByColumn, expandByColumn, activeColumns, activeData) =>
    convertEntityToTimelineEvent(viewByColumn, expandByColumn, activeColumns, activeData)
)

const selectFilteredActiveEventsAsMap = createSelector(selectFilteredActiveDataAsEventsWithoutColor, (events) => {
  const eventMap = new Map<EntityId, TimelineEvent<EntityId, any>>()

  events.forEach((event) => {
    eventMap.set(event.eventId, event)
  })

  return eventMap
})

export const selectSelectedActiveEntityAsEvent = createSelector(
  selectFilteredActiveEventsAsMap,
  selectActiveSelectedEntity,
  (eventMap, selectedEntity) => eventMap.get(selectedEntity)
)

export const selectHoveredActiveEntityAsEvent = createSelector(
  selectFilteredActiveEventsAsMap,
  selectActiveHoveredEntity,
  (eventMap, hoveredEntity) => eventMap.get(hoveredEntity)
)

const selectColorByCategoryFn = (s: RootState, colorByCategoryFn: ColorByCategoryFn): ColorByCategoryFn =>
  colorByCategoryFn

export const selectFilteredActiveDataAsLanes = createSelector(
  selectExpandByColumn,
  selectFilteredActiveData,
  selectColorByCategoryFn,
  (expandByColumn, activeData, colorByCategoryFn) =>
    Array.from(
      new Set(
        (activeData as ReadonlyArray<Entity & { pid: PatientId }>).map((event) =>
          expandByColumn === TimelineColumnNone ? event.pid : event.values[expandByColumn.index]
        )
      )
    ).map((value) => ({
      laneId: value,
      label: value, // TODO: Proper label
      color: expandByColumn !== TimelineColumnNone ? colorByCategoryFn(value) : undefined,
    })) as ReadonlyArray<TimelineLane<any>>
)

export const selectCursorPosition = (s: RootState): CursorPosition => s.timeline.cursorPosition
