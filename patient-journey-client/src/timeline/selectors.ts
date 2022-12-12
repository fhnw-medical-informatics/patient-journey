import { createSelector } from '@reduxjs/toolkit'
import { group } from 'd3-array'
import { TimelineEvent, TimelineLane } from 'react-svg-timeline'
import { ColorByColumn, ColorByColumnNone } from '../color/colorSlice'
import { ColorByCategoryFn, ColorByColumnFn } from '../color/hooks'
import { stringToMillis } from '../data/columns'
import { FocusEntity } from '../data/dataSlice'
import { Entity, EntityId } from '../data/entities'
import { EventDataColumn, PatientJourneyEvent } from '../data/events'
import { Patient, PatientId, PatientIdNone, PatientDataColumn } from '../data/patients'
import {
  selectActiveSelectedEntity,
  selectEventDataColumns,
  selectCrossFilteredEventData,
  selectActiveHoveredEventEntity,
  selectActiveSelectedEventEntity,
  selectCrossFilteredEventDataOnlyFilteredOutEvents,
  selectIndexPatientId,
  selectCrossFilteredPatientData,
  selectHoveredEntity,
  selectSelectedEntity,
  selectPatientDataColumns,
} from '../data/selectors'
import { ColumnSortingState, stableSort } from '../data/sorting'
import { RootState } from '../store'
import { TimelineEventWithPID } from './model'
import { CursorPosition, TimelineColumn, TimelineColumnNone } from './timelineSlice'

export const selectTimelineCluster = (s: RootState): boolean => s.timeline.cluster

export const selectShowTimeGrid = (s: RootState) => s.timeline.showTimeGrid

export const selectAllowInteraction = (s: RootState): boolean => s.timeline.allowInteraction

export const selectShowFilteredOut = (s: RootState): boolean => s.timeline.showFilteredOut

export const selectViewByColumn = (s: RootState): TimelineColumn => s.timeline.viewByColumn

export const selectExpandByColumn = (s: RootState): TimelineColumn => s.timeline.expandByColumn

export const selectSortByState = (s: RootState): ColumnSortingState => s.timeline.sortByState

// https://redux.js.org/usage/deriving-data-selectors#createselector-behavior
const selectColorByColumnFn = (
  s: RootState,
  colorByColumnFn: ColorByColumnFn,
  filteredOutColor: string
): ColorByColumnFn => colorByColumnFn

const selectFilteredOutColor = (s: RootState, colorByColumnFn: ColorByColumnFn, filteredOutColor: string): string =>
  filteredOutColor

const convertEntityToTimelineEvent = (
  viewByColumn: TimelineColumn,
  expandByColumn: TimelineColumn,
  activeColumns: ReadonlyArray<EventDataColumn>,
  activeData: ReadonlyArray<PatientJourneyEvent>,
  indexPatientId: PatientId,
  colorByColumnFn?: ColorByColumnFn
) => {
  return viewByColumn !== TimelineColumnNone &&
    activeColumns.findIndex((column) => column.name === viewByColumn.name && column.index === viewByColumn.index) !== -1
    ? (activeData.map((event) => ({
        eventId: event.uid,
        laneId: expandByColumn === TimelineColumnNone ? event.pid : event.values[expandByColumn.index],
        isPinned: event.pid === indexPatientId,
        color: colorByColumnFn ? colorByColumnFn(event) : undefined,
        startTimeMillis:
          viewByColumn.type === 'date'
            ? stringToMillis(event.values[viewByColumn.index])
            : +event.values[viewByColumn.index],
        pid: event.pid,
      })) as ReadonlyArray<TimelineEventWithPID<EntityId, any>>)
    : []
}

const selectEventDataAsTimelineEvents = (
  viewByColumn: TimelineColumn,
  expandByColumn: TimelineColumn,
  activeColumns: ReadonlyArray<EventDataColumn>,
  filteredEventData: ReadonlyArray<PatientJourneyEvent>,
  colorByColumnFn: ColorByColumnFn,
  filteredOutEventData: ReadonlyArray<PatientJourneyEvent>,
  showFilteredOut: boolean,
  filteredOutColor: string,
  indexPatientId: PatientId
) => {
  const filteredEventDataAsTimelineEvents = convertEntityToTimelineEvent(
    viewByColumn,
    expandByColumn,
    activeColumns,
    filteredEventData,
    indexPatientId,
    colorByColumnFn
  )

  if (showFilteredOut) {
    const filteredOutEventDataAsTimelineEvents = convertEntityToTimelineEvent(
      viewByColumn,
      expandByColumn,
      activeColumns,
      filteredOutEventData,
      indexPatientId,
      () => filteredOutColor
    )

    return [...filteredEventDataAsTimelineEvents, ...filteredOutEventDataAsTimelineEvents]
  } else {
    return filteredEventDataAsTimelineEvents
  }
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
  selectEventDataAsTimelineEvents
)

// Using a separate selector here, so that we can memoize this better, since
// we are calling it from TimelineActiveMarks with a new colorByColumnFn vs.
// in Timeline.tsx
// ---
const selectFilteredEventDataAsTimelineEventsForActiveMarks = createSelector(
  selectViewByColumn,
  selectExpandByColumn,
  selectEventDataColumns,
  selectCrossFilteredEventData,
  selectColorByColumnFn,
  selectCrossFilteredEventDataOnlyFilteredOutEvents,
  selectShowFilteredOut,
  selectFilteredOutColor,
  selectIndexPatientId,
  selectEventDataAsTimelineEvents
)

export const selectFilteredEventDataAsTimelineEventsForJourney = createSelector(
  selectViewByColumn,
  selectExpandByColumn,
  selectEventDataColumns,
  selectCrossFilteredEventData,
  selectColorByColumnFn,
  selectCrossFilteredEventDataOnlyFilteredOutEvents,
  selectShowFilteredOut,
  selectFilteredOutColor,
  selectIndexPatientId,
  selectEventDataAsTimelineEvents
)
// ---

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

const selectFilteredActiveEventsWithoutColorAsMap = createSelector(
  selectFilteredEventDataAsTimelineEventsWithoutColor,
  (events): ReadonlyMap<EntityId, TimelineEvent<EntityId, any>> => new Map(events.map((e) => [e.eventId, e]))
)

export const selectSelectedActiveEntityAsEvent = createSelector(
  selectFilteredActiveEventsWithoutColorAsMap,
  selectActiveSelectedEntity,
  (eventMap, selectedEntity) => eventMap.get(selectedEntity)
)

const selectFilteredActiveEventsAsMap = createSelector(
  selectFilteredEventDataAsTimelineEventsForActiveMarks,
  (events): ReadonlyMap<EntityId, TimelineEvent<EntityId, any>> => new Map(events.map((e) => [e.eventId, e]))
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

const selectLaneIdFromEntity = (eventMap: ReadonlyMap<EntityId, TimelineEvent<EntityId, any>>, entity: FocusEntity) => {
  switch (entity.type) {
    case 'patients':
      return entity.uid
    case 'events':
      return (eventMap.get(entity.uid)?.laneId as PatientId) ?? PatientIdNone
    default:
      return PatientIdNone
  }
}

export const selectHoveredEntityLaneId = createSelector(
  selectFilteredActiveEventsWithoutColorAsMap,
  selectHoveredEntity,
  selectLaneIdFromEntity
)

export const selectSelectedEntityLaneId = createSelector(
  selectFilteredActiveEventsWithoutColorAsMap,
  selectSelectedEntity,
  selectLaneIdFromEntity
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

// Define and return derived event data columns for sorting
const selectDerivedEventDataColums = createSelector(
  selectEventDataColumns,
  selectExpandByColumn,
  (eventDataColumns, expandByColumn): ReadonlyArray<EventDataColumn> => {
    if (expandByColumn !== TimelineColumnNone && expandByColumn.type !== 'pid') {
      return [
        {
          ...expandByColumn,
          name: 'Alphabetically',
        },
        {
          index: eventDataColumns[eventDataColumns.length - 1].index + 1,
          name: 'Number of Events',
          type: 'number',
        },
      ]
    } else {
      return []
    }
  }
)

// Group events by their value of the selected expandByColumn
const selectCrossFilteredEventDataWithFilteredOutEventsAsExpandedColumnMap = createSelector(
  selectExpandByColumn,
  selectCrossFilteredEventDataWithFilteredOutEvents,
  (expandByColumn, events): ReadonlyMap<string, ReadonlyArray<PatientJourneyEvent>> =>
    expandByColumn !== TimelineColumnNone ? group(events, (e) => e.values[expandByColumn.index]) : new Map()
)

/**
 * A selector that returns the event data with derived columns added.
 * The derived columns are defined in the `selectDerivedEventDataColumns` selector.
 * The derived columns are added to the event data if the `sortByState` is set to a derived column.
 */
const selectCrossFilteredEventDataWithFilteredOutEventsAndWithDerivedColumns = createSelector(
  selectSortByState,
  selectExpandByColumn,
  selectDerivedEventDataColums,
  selectCrossFilteredEventDataWithFilteredOutEvents,
  selectCrossFilteredEventDataWithFilteredOutEventsAsExpandedColumnMap,
  (
    sortByState,
    expandByColumn,
    derivedEventDataColumns,
    crossFilteredEventDataWithFilteredOutEvents,
    crossFilteredEventDataWithFilteredOutEventsAsExpandedColumnMap
  ) => {
    if (
      expandByColumn !== TimelineColumnNone &&
      sortByState.type !== 'neutral' &&
      derivedEventDataColumns.includes(sortByState.column as EventDataColumn)
    ) {
      return crossFilteredEventDataWithFilteredOutEvents.map((eventData) => {
        const expandByEventData =
          crossFilteredEventDataWithFilteredOutEventsAsExpandedColumnMap.get(eventData.values[expandByColumn.index]) ??
          []

        const derivedColumnValues: string[] = [`${expandByEventData.length}`]

        return {
          ...eventData,
          values: [...eventData.values, ...derivedColumnValues],
        }
      })
    } else {
      // Not sorting by derived column, so just return the crossFilteredEventDataWithFilteredOutEvents
      return crossFilteredEventDataWithFilteredOutEvents
    }
  }
)

// Define and return derived patient data columns for sorting
const selectDerivedPatientDataColumns = createSelector(selectPatientDataColumns, (patientDataColumns) => {
  const derivedPatientDataColumns: PatientDataColumn[] = []

  derivedPatientDataColumns.push({
    index: patientDataColumns[patientDataColumns.length - 1].index + 1,
    name: 'Number of Events',
    type: 'number',
  })

  derivedPatientDataColumns.push({
    index: patientDataColumns[patientDataColumns.length - 1].index + 2,
    name: 'Time of first event',
    type: 'timestamp',
  })

  derivedPatientDataColumns.push({
    index: patientDataColumns[patientDataColumns.length - 1].index + 3,
    name: 'Time of last event',
    type: 'timestamp',
  })

  return derivedPatientDataColumns
})

const selectCrossFilteredEventDataWithFilteredOutEventsAsPatientMap = createSelector(
  selectCrossFilteredEventDataWithFilteredOutEvents,
  (events): ReadonlyMap<PatientId, ReadonlyArray<PatientJourneyEvent>> => group(events, (e) => e.pid)
)

/**
 * A selector that returns the patient data with derived columns added.
 * The derived columns are defined in the `selectDerivedPatientDataColumns` selector.
 * The derived columns are added to the patient data if the `sortByState` is set to a derived column.
 * Timestamps for the first and last events are retrieved from the currently selected viewByColumn.
 */
const selectCrossFilteredPatientDataWithDerivedColumns = createSelector(
  selectSortByState,
  selectViewByColumn,
  selectDerivedPatientDataColumns,
  selectCrossFilteredPatientData,
  selectCrossFilteredEventDataWithFilteredOutEventsAsPatientMap,
  (
    sortByState,
    viewByColumn,
    derivedPatientDataColumns,
    crossFilteredPatientData,
    crossFilteredEventDataAsPatientMap
  ) => {
    if (sortByState.type !== 'neutral' && derivedPatientDataColumns.includes(sortByState.column as PatientDataColumn)) {
      return crossFilteredPatientData.map((patientData) => {
        const patientEventData = crossFilteredEventDataAsPatientMap.get(patientData.pid) ?? []

        const derivedColumnValues: string[] = [
          `${patientEventData.length}`,
          patientEventData.length > 0 && viewByColumn !== TimelineColumnNone
            ? patientEventData[0].values[viewByColumn.index]
            : '',
          patientEventData.length > 0 && viewByColumn !== TimelineColumnNone
            ? patientEventData[patientEventData.length - 1].values[viewByColumn.index]
            : '',
        ]

        return {
          ...patientData,
          values: [...patientData.values, ...derivedColumnValues],
        }
      })
    } else {
      // Not sorting by derived column, so just return the crossFilteredPatientData
      return crossFilteredPatientData
    }
  }
)

const selectLaneColorByColumnFn = (s: RootState, colorByColumnFn: ColorByColumnFn): ColorByColumnFn => colorByColumnFn

const selectColorByCategoryFn = (
  s: RootState,
  colorByColumnFn: ColorByColumnFn,
  colorByCategoryFn: ColorByCategoryFn
): ColorByCategoryFn => colorByCategoryFn

const selectColorByColumn = (
  s: RootState,
  colorByColumnFn: ColorByColumnFn,
  colorByCategory: ColorByCategoryFn,
  colorByColumn: ColorByColumn
): ColorByColumn => colorByColumn

export const selectFilteredEventDataAsTimelineLanes = createSelector(
  selectExpandByColumn,
  selectSortByState,
  selectCrossFilteredPatientDataWithDerivedColumns,
  selectCrossFilteredEventDataWithFilteredOutEventsAndWithDerivedColumns,
  selectLaneColorByColumnFn,
  selectColorByCategoryFn,
  selectColorByColumn,
  (
    expandByColumn,
    sortByState,
    activePatientData,
    activeEventData,
    colorByColumnFn,
    colorByCategoryFn,
    colorByColumn
  ) => {
    if (expandByColumn === TimelineColumnNone) {
      // No expand by column, so we just have one lane
      return []
    } else if (expandByColumn.type === 'pid') {
      // Expand by patient ID, so we have one lane per patient
      // use patient entities so we can color the lanes if a patient
      // column is select as color by column
      return (stableSort(activePatientData, sortByState) as Patient[]).map((patient) => ({
        laneId: patient.pid,
        label: patient.pid, // TODO: Proper label
        color: colorByColumn !== ColorByColumnNone ? colorByColumnFn(patient) : undefined,
      })) as ReadonlyArray<TimelineLane<any>>
    } else {
      // Expand by event column, so we have one lane per unique value of that column
      // only color the lanes if the same column is selected as color by column
      return Array.from(
        new Set(
          (stableSort(activeEventData, sortByState) as ReadonlyArray<Entity & { pid: PatientId }>).map(
            (event) => event.values[expandByColumn.index]
          )
        )
      ).map((value) => ({
        laneId: value,
        label: value, // TODO: Proper label
        color: colorByColumn.column === expandByColumn ? colorByCategoryFn(value) : undefined,
      })) as ReadonlyArray<TimelineLane<any>>
    }
  }
)

export const selectCursorPosition = (s: RootState): CursorPosition => s.timeline.cursorPosition

export const selectTimelineDataColumns = createSelector(selectEventDataColumns, (eventDataColumns) => eventDataColumns)

export const selectTimelineSortDataColumns = createSelector(
  selectExpandByColumn,
  selectPatientDataColumns,
  selectDerivedPatientDataColumns,
  selectDerivedEventDataColums,
  (expandByColumn, patientColumns, derivedPatientColumns, derivedEventColumns) => {
    if (expandByColumn === TimelineColumnNone) {
      return []
    } else if (expandByColumn.type === 'pid') {
      return [...patientColumns, ...derivedPatientColumns]
    } else {
      return derivedEventColumns
    }
  }
)
