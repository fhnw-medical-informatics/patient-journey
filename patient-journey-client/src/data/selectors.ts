import { createSelector } from '@reduxjs/toolkit'
import { max, min } from 'd3-array'
import { ColorByColumnNone } from '../color/colorSlice'
import { selectColorByColumn } from '../color/selectors'
import { RootState } from '../store'
import { DataColumn, extractCategoryValueSafe, stringToMillis } from './columns'
import { ActiveDataViewType, DataStateLoadingComplete, FocusEntity } from './dataSlice'
import { EventDataColumnType, PatientJourneyEvent } from './events'
import { filterReducer } from './filtering'
import { Patient, PatientDataColumnType } from './patients'
import { EntityIdNone } from './entities'

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

const selectPatientDataRows = createSelector(selectData, (data) => data.patientData.allEntities)
const selectEventDataRows = createSelector(selectData, (data) => data.eventData.allEntities)

export const selectActiveData = createSelector(
  selectDataView,
  selectPatientDataRows,
  selectEventDataRows,
  (view, patients, events) => (view === 'patients' ? patients : events)
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

export const selectEventDataColumn = createSelector(
  selectEventDataColumns,
  selectEventDataColumnType,
  (columns, columnType) => columns.find((c) => c.type === columnType)!
)

export const selectEventDataEidColumn = (s: RootState) => selectEventDataColumn(s, 'eid')
export const selectEventDataPidColumn = (s: RootState) => selectEventDataColumn(s, 'pid')
export const selectEventDataTimestampColumn = (s: RootState) => selectEventDataColumn(s, 'timestamp')

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
export const selectCrossFilteredPatientData = createSelector(
  selectFilteredPatientData,
  selectFilteredEventsPIDs,
  (filteredPatientData, filteredEventPIDSet) =>
    filteredPatientData.filter((patient) => filteredEventPIDSet.has(patient.pid))
)

// Only select events which referenced patients appear int the currently filtered patients
export const selectCrossFilteredEventData = createSelector(
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

const selectDataCategoryColumn = (s: RootState, column: DataColumn<'category'>) => column

export const selectAllActiveDataCategories = createSelector(
  selectActiveData,
  selectDataCategoryColumn,
  (activeData, column) => {
    const valueExtractor = extractCategoryValueSafe(column)
    return activeData.flatMap(valueExtractor)
  }
)

export const selectUniqueActiveDataCategories = createSelector(
  selectAllActiveDataCategories,
  (allActiveDataCategories) => {
    return Array.from(new Set(allActiveDataCategories))
  }
)
