import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { ActiveDataViewType } from './dataSlice'
import { EMPTY_EVENT_DATA, EventData, EventDataColumn } from './events'
import { filterReducer, GenericFilter } from './filtering'
import { EMPTY_PATIENT_DATA, PatientData, PatientDataColumn, PatientId } from './patients'

export const selectPatientData = (s: RootState): PatientData => {
  if (s.data.type === 'loading-complete') {
    return s.data.patientData
  } else {
    return EMPTY_PATIENT_DATA
  }
}

export const selectEventData = (s: RootState): EventData => {
  if (s.data.type === 'loading-complete') {
    return s.data.eventData
  } else {
    return EMPTY_EVENT_DATA
  }
}

export const selectActiveData = (s: RootState): PatientData | EventData => {
  if (s.data.type === 'loading-complete') {
    return s.data.view === 'patients' ? s.data.patientData : s.data.eventData
  } else {
    return EMPTY_PATIENT_DATA
  }
}

export const selectPatientDataColumns = (s: RootState): ReadonlyArray<PatientDataColumn> => {
  if (s.data.type === 'loading-complete') {
    return s.data.patientData.columns
  } else {
    return EMPTY_PATIENT_DATA.columns
  }
}

export const selectEventDataColumns = (s: RootState): ReadonlyArray<EventDataColumn> => {
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

export const selectSelectedPatient = (s: RootState): PatientId => selectPatientData(s).selectedPatient
export const selectHoveredPatient = (s: RootState): PatientId => selectPatientData(s).hoveredPatient

export const selectDataView = (s: RootState): ActiveDataViewType => {
  if (s.data.type === 'loading-complete') {
    return s.data.view
  } else {
    return 'patients'
  }
}

export const selectPatientFilters = (s: RootState): ReadonlyArray<GenericFilter> => {
  if (s.data.type === 'loading-complete') {
    const columns = s.data.patientData.columns
    return s.data.filters.filter((filter) => columns.findIndex((column) => column.name === filter.column.name) !== -1)
  } else {
    return []
  }
}

export const selectEventFilters = (s: RootState): ReadonlyArray<GenericFilter> => {
  if (s.data.type === 'loading-complete') {
    const columns = s.data.eventData.columns
    return s.data.filters.filter((filter) => columns.findIndex((column) => column.name === filter.column.name) !== -1)
  } else {
    return []
  }
}

export const selectActiveDataFilters = (s: RootState): ReadonlyArray<GenericFilter> => {
  if (s.data.type === 'loading-complete') {
    const columns = s.data.view === 'patients' ? s.data.patientData.columns : s.data.eventData.columns
    return s.data.filters.filter((filter) => columns.findIndex((column) => column.name === filter.column.name) !== -1)
  } else {
    return []
  }
}

export const selectFilteredPatientData = createSelector(
  selectPatientData,
  selectPatientFilters,
  (patientData, filters) => filters.reduce(filterReducer, patientData)
)

export const selectFilteredEventData = createSelector(selectEventData, selectEventFilters, (eventData, filters) =>
  filters.reduce(filterReducer, eventData)
)

// Using Set's is more performant for cross-filter computation
const selectFilteredPatientsPIDs = createSelector(
  selectFilteredPatientData,
  (filteredPatientData) => new Set(filteredPatientData.allPatients.map((patient) => patient.pid))
)

// Using Set's is more performant for cross-filter computation
const selectFilteredEventsPIDs = createSelector(
  selectFilteredEventData,
  (filteredEventData) => new Set(filteredEventData.allEvents.map((event) => event.pid))
)

// Only select patients, that are references in the currently filtered events
const selectCrossFilteredPatientData = createSelector(
  selectFilteredPatientData,
  selectFilteredEventsPIDs,
  (filteredPatientData, filteredEventPIDSet) =>
    ({
      ...filteredPatientData,
      allPatients: filteredPatientData.allPatients.filter((patient) => filteredEventPIDSet.has(patient.pid)),
    } as PatientData)
)

// Only select events which referenced patients appear int the currently filtered patients
const selectCrossFilteredEventData = createSelector(
  selectFilteredEventData,
  selectFilteredPatientsPIDs,
  (filteredEventData, filteredPatientPIDSet) =>
    ({
      ...filteredEventData,
      allEvents: filteredEventData.allEvents.filter((event) => filteredPatientPIDSet.has(event.pid)),
    } as EventData)
)

export const selectFilteredActiveData = createSelector(
  selectCrossFilteredPatientData,
  selectCrossFilteredEventData,
  selectDataView,
  (crossFilteredPatientData, crossFilteredEventData, view) =>
    // Filters applied to patients, to influence events as well (and vice versa)
    view === 'patients' ? crossFilteredPatientData : crossFilteredEventData
)
