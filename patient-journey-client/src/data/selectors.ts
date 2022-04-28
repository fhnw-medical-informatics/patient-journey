import { createSelector } from '@reduxjs/toolkit'
import { max, min } from 'd3-array'
import { ColorByColumnNone } from '../color/colorSlice'
import { selectColorByColumn } from '../color/selectors'
import { RootState } from '../store'
import { formatColumnValue, stringToMillis } from './columns'
import { ActiveDataViewType, DataStateLoadingComplete, FocusEntity } from './dataSlice'
import { EventDataColumnType, EventId, PatientJourneyEvent } from './events'
import { filterReducer } from './filtering'
import { Patient, PatientDataColumnType, PatientId } from './patients'
import { Entity, EntityId, EntityIdNone } from './entities'

const selectData = (s: RootState): DataStateLoadingComplete => {
  if (s.data.type === 'loading-complete') {
    return s.data
  } else {
    throw new Error('Illegal state')
  }
}

export const selectDataLoadingState = (s: RootState) => s.data.type

export const selectDataView = createSelector(selectData, (data) => data.view)

export const selectDataLoadingErrorMessage = (s: RootState): string => {
  if (s.data.type === 'loading-failed') {
    return s.data.errorMessage
  } else {
    return ''
  }
}

const entitiesToMap = (entities: ReadonlyArray<Entity>) => new Map(entities.map((e) => [e.uid, e]))

const selectPatientDataRows = createSelector(selectData, (data) => data.patientData.allEntities)
const selectPatientDataRowMap = createSelector(selectPatientDataRows, entitiesToMap)

const selectEventDataRows = createSelector(selectData, (data) => data.eventData.allEntities)
const selectEventDataRowMap = createSelector(selectEventDataRows, entitiesToMap)

export const selectActiveData = createSelector(
  selectDataView,
  selectPatientDataRows,
  selectEventDataRows,
  (view, patients, events) => (view === 'patients' ? patients : events)
)

export const selectActiveDataByEntityIdMap = createSelector(
  selectDataView,
  selectPatientDataRowMap,
  selectEventDataRowMap,
  (view, patientMap, eventMap): ReadonlyMap<EntityId, Entity> => (view === 'patients' ? patientMap : eventMap)
)

const selectPatientDataColumns = createSelector(selectData, (data) => data.patientData.columns)
const selectEventDataColumns = createSelector(selectData, (data) => data.eventData.columns)

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

const selectActiveEntity = (view: ActiveDataViewType, entity: FocusEntity) => {
  if ((view === 'patients' && entity.type === 'patient') || (view === 'events' && entity.type === 'event')) {
    return entity.uid
  } else {
    return EntityIdNone
  }
}

export const selectActiveSelectedEntity = createSelector(selectDataView, selectSelectedEntity, selectActiveEntity)
export const selectActiveHoveredEntity = createSelector(selectDataView, selectHoveredEntity, selectActiveEntity)

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

const selectEventFilters = createSelector(selectEventDataColumns, selectAllFilters, (eventDataColumns, filters) =>
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
const selectCrossFilteredPatientData = createSelector(
  selectFilteredPatientData,
  selectFilteredEventsPIDs,
  (filteredPatientData, filteredEventPIDSet) =>
    filteredPatientData.filter((patient) => filteredEventPIDSet.has(patient.pid))
)

// Only select events which referenced patients appear int the currently filtered patients
const selectCrossFilteredEventData = createSelector(
  selectFilteredEventData,
  selectFilteredPatientsPIDs,
  (filteredEventData, filteredPatientPIDSet) =>
    filteredEventData.filter((event) => filteredPatientPIDSet.has(event.pid))
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
  selectActiveData,
  selectColorByColumn,
  (activeData, colorByColumn) => {
    if (colorByColumn === ColorByColumnNone) {
      return null
    }

    switch (colorByColumn.type) {
      case 'timestamp':
      case 'number': {
        const dataInNumbers = activeData.map((data) => +data.values[colorByColumn.index])
        return [min(dataInNumbers) ?? 0, max(dataInNumbers) ?? 0]
      }
      case 'date': {
        const dataInNumbers = activeData.map((data) => stringToMillis(data.values[colorByColumn.index]))
        return [min(dataInNumbers) ?? 0, max(dataInNumbers) ?? 0]
      }
      default:
        return null
    }
  }
)
