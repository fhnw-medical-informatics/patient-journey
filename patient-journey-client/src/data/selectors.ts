import { createSelector } from '@reduxjs/toolkit'
import { max, min } from 'd3-array'
import { ColorByColumnNone } from '../color/colorSlice'
import { selectColorByColumn } from '../color/selectors'
import { RootState } from '../store'
import { DataColumn, extractQualityValueSafe, stringToMillis } from './columns'
import { ActiveDataViewType } from './dataSlice'
import { EntityId, EntityIdNone } from './entities'
import { EMPTY_EVENT_DATA, EventData, EventDataColumn, PatientJourneyEvent } from './events'
import { filterReducer, GenericFilter } from './filtering'
import { EMPTY_PATIENT_DATA, Patient, PatientData, PatientDataColumn } from './patients'

export const selectDataLoadingState = (s: RootState) => {
  return s.data.type
}

export const selectDataLoadingErrorMessage = (s: RootState): string => {
  if (s.data.type === 'loading-failed') {
    return s.data.errorMessage
  } else {
    return ''
  }
}

const selectPatientDataRows = (s: RootState): PatientData['allEntities'] => {
  if (s.data.type === 'loading-complete') {
    return s.data.patientData.allEntities
  } else {
    return EMPTY_PATIENT_DATA.allEntities
  }
}

const selectEventDataRows = (s: RootState): EventData['allEntities'] => {
  if (s.data.type === 'loading-complete') {
    return s.data.eventData.allEntities
  } else {
    return EMPTY_EVENT_DATA.allEntities
  }
}

export const selectActiveData = (s: RootState): PatientData['allEntities'] | EventData['allEntities'] => {
  if (s.data.type === 'loading-complete') {
    return s.data.view === 'patients' ? s.data.patientData.allEntities : s.data.eventData.allEntities
  } else {
    return EMPTY_PATIENT_DATA.allEntities
  }
}

const selectPatientDataColumns = (s: RootState): ReadonlyArray<PatientDataColumn> => {
  if (s.data.type === 'loading-complete') {
    return s.data.patientData.columns
  } else {
    return EMPTY_PATIENT_DATA.columns
  }
}

const selectEventDataColumns = (s: RootState): ReadonlyArray<EventDataColumn> => {
  if (s.data.type === 'loading-complete') {
    return s.data.eventData.columns
  } else {
    return EMPTY_EVENT_DATA.columns
  }
}

export const selectActiveDataColumns = (s: RootState): ReadonlyArray<PatientDataColumn | EventDataColumn> => {
  if (s.data.type === 'loading-complete') {
    return s.data.view === 'patients' ? s.data.patientData.columns : s.data.eventData.columns
  } else {
    return EMPTY_PATIENT_DATA.columns
  }
}

export const selectSelectedActiveEntity = (s: RootState): EntityId => {
  if (s.data.type === 'loading-complete') {
    return (s.data.view === 'patients' ? s.data.patientData : s.data.eventData).selectedEntity
  } else {
    return EntityIdNone
  }
}

export const selectHoveredActiveEntity = (s: RootState): EntityId => {
  if (s.data.type === 'loading-complete') {
    return (s.data.view === 'patients' ? s.data.patientData : s.data.eventData).hoveredEntity
  } else {
    return EntityIdNone
  }
}

export const selectDataView = (s: RootState): ActiveDataViewType => {
  if (s.data.type === 'loading-complete') {
    return s.data.view
  } else {
    return 'patients'
  }
}

export const selectAllFilters = (s: RootState): ReadonlyArray<GenericFilter> => {
  if (s.data.type === 'loading-complete') {
    return s.data.filters
  } else {
    return []
  }
}

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

export const selectAllActiveDataQualities = createSelector(
  selectActiveData,
  (s: RootState, column: DataColumn<'quality'>) => column,
  (activeData, column) => {
    const valueExtractor = extractQualityValueSafe(column)
    return activeData.flatMap(valueExtractor)
  }
)
