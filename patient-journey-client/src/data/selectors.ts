import { createSelector } from '@reduxjs/toolkit'
import { max, min } from 'd3-array'
import { ColorByColumnNone } from '../color/colorSlice'
import { selectColorByColumn } from '../color/selectors'
import { RootState } from '../store'
import { DataColumn, extractCategoryValueSafe, stringToMillis } from './columns'
import { ActiveDataViewType, FocusEntity } from './dataSlice'
import { EMPTY_EVENT_DATA, EventData, EventDataColumn, PatientJourneyEvent } from './events'
import { filterReducer, GenericFilter } from './filtering'
import { EMPTY_PATIENT_DATA, Patient, PatientData, PatientDataColumn } from './patients'
import { EntityIdNone } from './entities'

export const selectDataLoadingState = (s: RootState) => {
  return s.data.type
}

export const selectDataView = (s: RootState): ActiveDataViewType => {
  if (s.data.type === 'loading-complete') {
    return s.data.view
  } else {
    return 'patients'
  }
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

export const selectHoveredEntity = (s: RootState): FocusEntity => {
  if (s.data.type === 'loading-complete') {
    return s.data.hovered
  } else {
    throw new Error('Illegal State')
  }
}

export const selectSelectedEntity = (s: RootState): FocusEntity => {
  if (s.data.type === 'loading-complete') {
    return s.data.selected
  } else {
    throw new Error('Illegal State')
  }
}

const selectActiveEntity = (view: ActiveDataViewType, entity: FocusEntity) => {
  if ((view === 'patients' && entity.type === 'patient') || (view === 'events' && entity.type === 'event')) {
    return entity.uid
  } else {
    return EntityIdNone
  }
}

export const selectActiveSelectedEntity = createSelector(selectDataView, selectSelectedEntity, selectActiveEntity)
export const selectActiveHoveredEntity = createSelector(selectDataView, selectHoveredEntity, selectActiveEntity)

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
