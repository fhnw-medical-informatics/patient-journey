import { createSelector } from '@reduxjs/toolkit'
import { max, min } from 'd3-array'
import { ColorByColumnOptionNone } from '../color/colorSlice'
import { selectColorByColumn } from '../color/selectors'
import { RootState } from '../store'
import { formatColumnValue, stringToMillis } from './columns'
import { ActiveDataViewType, DataStateLoadingComplete, FocusEntity } from './dataSlice'
import { EventDataColumnType, EventId, PatientJourneyEvent } from './events'
import { FilterColumn, filterReducer } from './filtering'
import { Patient, PatientDataColumn, PatientDataColumnType, PatientId, PatientIdNone } from './patients'
import { Entity, EntityId, EntityIdNone } from './entities'
import { LoadingProgress } from './loading'

export const selectData = (s: RootState): DataStateLoadingComplete => {
  if (s.data.type === 'loading-complete') {
    return s.data
  } else {
    throw new Error('Illegal state')
  }
}

export const selectDataLoadingState = (s: RootState) => s.data.type

export const selectDataLoadingProgress = (s: RootState): LoadingProgress => {
  if (s.data.type === 'loading-in-progress') {
    return s.data
  } else {
    throw new Error('Illegal state')
  }
}

export const selectDataView = createSelector(selectData, (data) => data.view)

export const selectDataLoadingErrorMessage = (s: RootState): string => {
  if (s.data.type === 'loading-failed') {
    return s.data.errorMessage
  } else {
    return ''
  }
}

const selectPatientData = createSelector(selectData, (data) => data.patientData)

export const selectPatientCount = createSelector(selectPatientData, (data) => data.allEntities.length)

export const selectIndexPatientId = createSelector(selectData, (data) => data.indexPatientId)

export const selectIndexPatientIdIndex = createSelector(
  selectData,
  selectIndexPatientId,
  (data, indexPatientId) => data.similarityData.patientIdMap[indexPatientId]
)

export const selectSimilarityDataLoadingState = createSelector(
  selectData,
  (data) => data.similarityData.indexPatientSimilarities.type
)

export const selectSimilarityDataLoadingErrorMessage = createSelector(selectData, (data) => {
  if (data.similarityData.indexPatientSimilarities.type === 'loading-failed') {
    return data.similarityData.indexPatientSimilarities.errorMessage
  } else {
    return ''
  }
})

const selectSimilarityData = createSelector(selectData, selectIndexPatientId, (data, indexPatientId) =>
  indexPatientId !== PatientIdNone && data.similarityData.indexPatientSimilarities.type === 'loading-complete'
    ? data.similarityData.indexPatientSimilarities.similarities
    : null
)

const selectPatientDataRows = createSelector(selectPatientData, selectSimilarityData, (patientData, similarityData) =>
  similarityData === null
    ? patientData.allEntities
    : patientData.allEntities.map((entity, idx) => ({
        ...entity,
        values: [...entity.values, `${similarityData[idx]}`],
      }))
)

const selectEventData = createSelector(selectData, (data) => data.eventData)

export const selectEventDataRows = createSelector(selectEventData, (eventData) => eventData.allEntities)

export const selectIndexPatientEvents = createSelector(
  selectIndexPatientId,
  selectEventDataRows,
  (indexPatientId, eventDataRows) =>
    eventDataRows.filter((e) => e.pid === indexPatientId) as ReadonlyArray<PatientJourneyEvent>
)

const entitiesToMap = (entities: ReadonlyArray<Entity>) => new Map<EntityId, Entity>(entities.map((e) => [e.uid, e]))

export const selectPatientDataRowMap = createSelector(selectPatientDataRows, entitiesToMap)
const selectEventDataRowMap = createSelector(selectEventDataRows, entitiesToMap)

export const selectActiveData = createSelector(
  selectDataView,
  selectPatientDataRows,
  selectEventDataRows,
  (view, patients, events) => (view === 'patients' ? patients : events)
)

const selectFocusEntityType = (s: RootState, type: FocusEntity['type']) => type

export const selectDataByEntityIdMap = createSelector(
  selectFocusEntityType,
  selectPatientDataRowMap,
  selectEventDataRowMap,
  (type, patientMap, eventMap) => (type === 'none' ? new Map() : type === 'patients' ? patientMap : eventMap)
)

export const selectPatientDataColumns = createSelector(
  selectPatientData,
  selectIndexPatientId,
  (patientData, indexPatientId) =>
    indexPatientId === PatientIdNone
      ? patientData.columns
      : ([
          ...patientData.columns,
          { name: 'Similarity', type: 'number', index: patientData.columns.length },
        ] as ReadonlyArray<PatientDataColumn>)
)
export const selectEventDataColumns = createSelector(selectEventData, (eventData) => eventData.columns)

export const selectActiveDataColumns = createSelector(
  selectDataView,
  selectPatientDataColumns,
  selectEventDataColumns,
  (view, patientDataColumns, eventDataColumns) => (view === 'patients' ? patientDataColumns : eventDataColumns)
)

export const selectHoveredEntity = createSelector(selectData, (data) => data.hovered)
export const selectSelectedEntity = createSelector(selectData, (data) => data.selected)
export const selectFocusEntity = createSelector(selectHoveredEntity, selectSelectedEntity, (hovered, selected) =>
  hovered.type !== 'none' ? hovered : selected
)

const selectActiveEntity = (eventMap: Map<EntityId, Entity>, view: ActiveDataViewType, entity: FocusEntity) => {
  if ((view === 'patients' && entity.type === 'patients') || (view === 'events' && entity.type === 'events')) {
    return entity.uid
  } else if (view === 'patients' && entity.type === 'events') {
    return (eventMap.get(entity.uid) as PatientJourneyEvent)?.pid ?? PatientIdNone
  } else {
    return EntityIdNone
  }
}

export const selectActiveSelectedEntity = createSelector(
  selectEventDataRowMap,
  selectDataView,
  selectSelectedEntity,
  selectActiveEntity
)
export const selectActiveSelectedEventEntity = createSelector(
  selectEventDataRowMap,
  selectSelectedEntity,
  (eventMap, entity) => selectActiveEntity(eventMap, 'events', entity)
)
export const selectActiveHoveredEventEntity = createSelector(
  selectEventDataRowMap,
  selectHoveredEntity,
  (eventMap, entity) => selectActiveEntity(eventMap, 'events', entity)
)

const selectPatientDataColumnType = (s: RootState, columnType: PatientDataColumnType) => columnType

export const selectPatientDataColumn = createSelector(
  selectPatientDataColumns,
  selectPatientDataColumnType,
  (columns, columnType) => columns.find((c) => c.type === columnType)!
)

export const selectPatientDataPidColumn = (s: RootState) => selectPatientDataColumn(s, 'pid')

const selectEventDataColumnType = (s: RootState, columnType: EventDataColumnType) => columnType

// TODO: Altough it doesn't seem to be an issue right now, this selectors memoization
// is not effective as it is called multiple times with different columnType (overwriting the memoized value each time)
const selectEventDataColumn = createSelector(
  selectEventDataColumns,
  selectEventDataColumnType,
  (columns, columnType) => columns.find((c) => c.type === columnType)!
)

export const selectEventDataEidColumn = (s: RootState) => selectEventDataColumn(s, 'eid')
export const selectEventDataPidColumn = (s: RootState) => selectEventDataColumn(s, 'pid')
export const selectEventDataTimestampColumn = (s: RootState) => selectEventDataColumn(s, 'timestamp')

const selectEventDataByIdMap = createSelector(
  selectEventDataRows,
  (events): ReadonlyMap<EventId, PatientJourneyEvent> => new Map(events.map((e) => [e.eid, e]))
)

// TODO: This always leads to re-rendering a component because the selector
// always returns a new function --> use the parameterized selector pattern instead
export const selectEventDataPidValues = createSelector(
  selectEventDataByIdMap,
  selectEventDataPidColumn,
  (eventByIdMap, column) => {
    return (eid: EventId) => {
      return eventByIdMap.get(eid)!.values[column.index] as PatientId
    }
  }
)

export const selectEventDataTimestampValuesFormatted = createSelector(
  selectEventDataByIdMap,
  selectEventDataTimestampColumn,
  (eventByIdMap, column) => {
    return (eid: EventId) => {
      const event = eventByIdMap.get(eid)
      if (event) {
        const value = event.values[column.index]
        return formatColumnValue(column.type)(value)
      } else {
        return ''
      }
    }
  }
)

export const selectAllFilters = createSelector(selectData, (data) => data.filters)

const selectPatientFilters = createSelector(selectPatientDataColumns, selectAllFilters, (patientDataColumns, filters) =>
  filters.filter((filter) => patientDataColumns.findIndex((column) => column.name === filter.column.name) !== -1)
)

export const selectEventFilters = createSelector(
  selectEventDataColumns,
  selectAllFilters,
  (eventDataColumns, filters) =>
    filters.filter((filter) => eventDataColumns.findIndex((column) => column.name === filter.column.name) !== -1)
)

const selectFilteredPatientData = createSelector(
  selectPatientDataRows,
  selectPatientFilters,
  (patientDataRows, filters) => filters.reduce(filterReducer, patientDataRows) as ReadonlyArray<Patient>
)

const selectFilteredEventData = createSelector(
  selectEventDataRows,
  selectEventFilters,
  (eventDataRows, filters) => filters.reduce<any>(filterReducer, eventDataRows) as ReadonlyArray<PatientJourneyEvent>
)

// Using Set's is more performant for cross-filter computation
const selectFilteredPatientsPIDs = createSelector(
  selectFilteredPatientData,
  (filteredPatientData) => new Set(filteredPatientData.map((patient) => patient.pid))
)

// Using Set's is more performant for cross-filter computation
const selectFilteredEventsPIDs = createSelector(
  selectFilteredEventData,
  (filteredEventData) => new Set(filteredEventData.map((event) => event.pid))
)

// Only select patients, that are references in the currently filtered events
export const selectCrossFilteredPatientData = createSelector(
  selectFilteredPatientData,
  selectFilteredEventsPIDs,
  (filteredPatientData, filteredEventPIDSet) =>
    filteredPatientData.filter((patient) => filteredEventPIDSet.has(patient.pid))
)

const selectCrossFilteredPatientsPIDs = createSelector(
  selectCrossFilteredPatientData,
  (crossFilteredPatientData) => new Set(crossFilteredPatientData.map((patient) => patient.pid))
)

// Only select filtered events which referenced patients appear in the currently filtered patients
export const selectCrossFilteredEventData = createSelector(
  selectFilteredEventData,
  selectFilteredPatientsPIDs,
  (filteredEventData, filteredPatientPIDSet) =>
    filteredEventData.filter((event) => filteredPatientPIDSet.has(event.pid))
)

const selectCrossFilteredEventsUIDs = createSelector(
  selectCrossFilteredEventData,
  (crossFilteredEventData) => new Set(crossFilteredEventData.map((event) => event.uid))
)

// Select all events that are filtered OUT by applied event filters, but are referenced by filtered IN patients
export const selectCrossFilteredEventDataOnlyFilteredOutEvents = createSelector(
  selectEventDataRows,
  selectCrossFilteredPatientsPIDs,
  selectCrossFilteredEventsUIDs,
  (allEvents, crossFilteredPatientsPIDs, crossFilteredEventsPIDs) =>
    allEvents.filter((event) => crossFilteredPatientsPIDs.has(event.pid) && !crossFilteredEventsPIDs.has(event.uid))
)

export const selectFilteredActiveData = createSelector(
  selectCrossFilteredPatientData,
  selectCrossFilteredEventData,
  selectDataView,
  (crossFilteredPatientData, crossFilteredEventData, view) =>
    // Filters applied to patients, to influence events as well (and vice versa)
    view === 'patients' ? crossFilteredPatientData : crossFilteredEventData
)

export const selectCurrentColorColumnNumberRange = createSelector(
  selectPatientDataRows,
  selectEventDataRows,
  selectColorByColumn,
  (patients, events, colorByColumn) => {
    if (colorByColumn.type === 'none' || colorByColumn.column === ColorByColumnOptionNone) {
      return null
    }

    const activeData = colorByColumn.type === 'patients' ? patients : events

    switch (colorByColumn.column.type) {
      case 'timestamp':
      case 'number': {
        const dataInNumbers = activeData.map((data) => +data.values[(colorByColumn.column as FilterColumn).index])
        return [min(dataInNumbers) ?? 0, max(dataInNumbers) ?? 0]
      }
      case 'date': {
        const dataInNumbers = activeData.map((data) =>
          stringToMillis(data.values[(colorByColumn.column as FilterColumn).index])
        )
        return [min(dataInNumbers) ?? 0, max(dataInNumbers) ?? 0]
      }
      default:
        return null
    }
  }
)

export const selectSplitPaneResizing = createSelector(selectData, (data) => data.isResizing)
