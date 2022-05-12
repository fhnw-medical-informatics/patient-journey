import { createSelector } from '@reduxjs/toolkit'
import { TimelineEvent, TimelineLane } from 'react-svg-timeline'
import { ColorByCategoryFn, ColorByColumnFn } from '../color/hooks'
import { stringToMillis } from '../data/columns'
import { Entity, EntityId } from '../data/entities'
import { EventDataColumn, PatientJourneyEvent } from '../data/events'
import { PatientId, PatientIdNone } from '../data/patients'
import {
  selectActiveSelectedEntity,
  selectEventDataColumns,
  selectCrossFilteredEventData,
  selectActiveHoveredEventEntity,
  selectActiveSelectedEventEntity,
  selectFocusEntity,
  selectCrossFilteredEventDataOnlyFilteredOutEvents,
  selectIndexPatientId,
} from '../data/selectors'
import { RootState } from '../store'
import { CursorPosition, TimelineColumn, TimelineColumnNone } from './timelineSlice'

export const selectTimelineCluster = (s: RootState): boolean => s.timeline.cluster

export const selectShowTimeGrid = (s: RootState) => s.timeline.showTimeGrid

export const selectShowFilteredOut = (s: RootState): boolean => s.timeline.showFilteredOut

export const selectViewByColumn = (s: RootState): TimelineColumn => s.timeline.viewByColumn

export const selectExpandByColumn = (s: RootState): TimelineColumn => s.timeline.expandByColumn

// https://redux.js.org/usage/deriving-data-selectors#createselector-behavior
const selectColorByColumnFn = (
  s: RootState,
  colorByColumnFn: ColorByColumnFn,
  filteredOutColor: string,
  indexPatientColor: string
): ColorByColumnFn => colorByColumnFn

const selectFilteredOutColor = (
  s: RootState,
  colorByColumnFn: ColorByColumnFn,
  filteredOutColor: string,
  indexPatientColor: string
): string => filteredOutColor

const selectIndexPatientColor = (
  s: RootState,
  colorByColumnFn: ColorByColumnFn,
  filteredOutColor: string,
  indexPatientColor: string
): string => indexPatientColor

const convertEntityToTimelineEvent = (
  viewByColumn: TimelineColumn,
  expandByColumn: TimelineColumn,
  activeColumns: ReadonlyArray<EventDataColumn>,
  activeData: ReadonlyArray<PatientJourneyEvent>,
  indexPatientId: PatientId,
  indexPatientColor?: string,
  colorByColumnFn?: ColorByColumnFn
) => {
  return viewByColumn !== TimelineColumnNone &&
    activeColumns.findIndex((column) => column.name === viewByColumn.name && column.index === viewByColumn.index) !== -1
    ? (activeData.map((event) => ({
        eventId: event.uid,
        laneId: expandByColumn === TimelineColumnNone ? event.pid : event.values[expandByColumn.index],
        isPinned: event.pid === indexPatientId,
        color: event.pid === indexPatientId ? indexPatientColor : colorByColumnFn ? colorByColumnFn(event) : undefined,
        startTimeMillis:
          viewByColumn.type === 'date'
            ? stringToMillis(event.values[viewByColumn.index])
            : +event.values[viewByColumn.index],
      })) as ReadonlyArray<TimelineEvent<EntityId, any>>)
    : []
}

export const selectFilteredEventDataAsTimelineEvents = createSelector(
  selectViewByColumn,
  selectExpandByColumn,
  selectEventDataColumns,
  selectCrossFilteredEventData,
  selectColorByColumnFn,
  selectCrossFilteredEventDataOnlyFilteredOutEvents,
  selectShowFilteredOut,
  selectFilteredOutColor,
  selectIndexPatientId,
  selectIndexPatientColor,
  (
    viewByColumn,
    expandByColumn,
    activeColumns,
    filteredEventData,
    colorByColumnFn,
    filteredOutEventData,
    showFilteredOut,
    filteredOutColor,
    indexPatientId,
    indexPatientColor
  ) => {
    const filteredEventDataAsTimelineEvents = convertEntityToTimelineEvent(
      viewByColumn,
      expandByColumn,
      activeColumns,
      filteredEventData,
      indexPatientId,
      indexPatientColor,
      colorByColumnFn
    )

    if (showFilteredOut) {
      const filteredOutEventDataAsTimelineEvents = convertEntityToTimelineEvent(
        viewByColumn,
        expandByColumn,
        activeColumns,
        filteredOutEventData,
        indexPatientId,
        indexPatientColor,
        () => filteredOutColor
      )

      return [...filteredEventDataAsTimelineEvents, ...filteredOutEventDataAsTimelineEvents]
    } else {
      return filteredEventDataAsTimelineEvents
    }
  }
)

export const selectFilteredEventDataAsTimelineEventsWithoutColor = createSelector(
  selectViewByColumn,
  selectExpandByColumn,
  selectEventDataColumns,
  selectCrossFilteredEventData,
  selectCrossFilteredEventDataOnlyFilteredOutEvents,
  selectShowFilteredOut,
  selectIndexPatientId,
  (
    viewByColumn,
    expandByColumn,
    activeColumns,
    filteredEventData,
    filteredOutEventData,
    showFilteredOut,
    indexPatientId
  ) => {
    const filteredEventDataAsTimelineEvents = convertEntityToTimelineEvent(
      viewByColumn,
      expandByColumn,
      activeColumns,
      filteredEventData,
      indexPatientId
    )

    if (showFilteredOut) {
      const filteredOutEventDataAsTimelineEvents = convertEntityToTimelineEvent(
        viewByColumn,
        expandByColumn,
        activeColumns,
        filteredOutEventData,
        indexPatientId
      )

      return [...filteredEventDataAsTimelineEvents, ...filteredOutEventDataAsTimelineEvents]
    } else {
      return filteredEventDataAsTimelineEvents
    }
  }
)

const selectFilteredActiveEventsAsMap = createSelector(
  selectFilteredEventDataAsTimelineEventsWithoutColor,
  (events): ReadonlyMap<EntityId, TimelineEvent<EntityId, any>> => new Map(events.map((e) => [e.eventId, e]))
)

export const selectSelectedActiveEntityAsEvent = createSelector(
  selectFilteredActiveEventsAsMap,
  selectActiveSelectedEntity,
  (eventMap, selectedEntity) => eventMap.get(selectedEntity)
)

export const selectSelectedActiveEvent = createSelector(
  selectFilteredActiveEventsAsMap,
  selectActiveSelectedEventEntity,
  (eventMap, selectedEntity) => eventMap.get(selectedEntity)
)

export const selectHoveredActiveEvent = createSelector(
  selectFilteredActiveEventsAsMap,
  selectActiveHoveredEventEntity,
  (eventMap, hoveredEntity) => eventMap.get(hoveredEntity)
)

export const selectFocusLaneId = createSelector(
  selectFilteredActiveEventsAsMap,
  selectFocusEntity,
  (eventMap, focusEntity): PatientId => {
    switch (focusEntity.type) {
      case 'patients':
        return focusEntity.uid
      case 'events':
        return (eventMap.get(focusEntity.uid)?.laneId as PatientId) ?? PatientIdNone
      default:
        return PatientIdNone
    }
  }
)

const selectCrossFilteredEventDataWithFilteredOutEvents = createSelector(
  selectCrossFilteredEventData,
  selectCrossFilteredEventDataOnlyFilteredOutEvents,
  selectShowFilteredOut,
  (filteredEventData, filteredOutEventData, showFilteredOut) => {
    if (showFilteredOut) {
      return [...filteredEventData, ...filteredOutEventData]
    } else {
      return filteredEventData
    }
  }
)

const selectColorByCategoryFn = (s: RootState, colorByCategoryFn: ColorByCategoryFn): ColorByCategoryFn =>
  colorByCategoryFn

export const selectFilteredEventDataAsTimelineLanes = createSelector(
  selectExpandByColumn,
  selectCrossFilteredEventDataWithFilteredOutEvents,
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
