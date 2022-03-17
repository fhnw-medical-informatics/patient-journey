import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { ActiveDataViewType } from './dataSlice'
import { EMPTY_EVENT_DATA, EventData, EventDataColumn, PatientJourneyEvent } from './events'
import { filterReducer, GenericFilter } from './filtering'
import { EMPTY_PATIENT_DATA, PatientData, PatientDataColumn, PatientId } from './patients'

const selectPatientData = (s: RootState): PatientData => {
  if (s.data.type === 'loading-complete') {
    return s.data.patientData
  } else {
    return EMPTY_PATIENT_DATA
  }
}

// const selectEventData = (s: RootState): EventData => {
//   if (s.data.type === 'loading-complete') {
//     return s.data.eventData
//   } else {
//     return EMPTY_EVENT_DATA
//   }
// }

const selectPatientDataRows = (s: RootState): PatientData['allPatients'] => {
  if (s.data.type === 'loading-complete') {
    return s.data.patientData.allPatients
  } else {
    return EMPTY_PATIENT_DATA.allPatients
  }
}

const selectEventDataRows = (s: RootState): EventData['allEvents'] => {
  if (s.data.type === 'loading-complete') {
    return s.data.eventData.allEvents
  } else {
    return EMPTY_EVENT_DATA.allEvents
  }
}

export const selectActiveData = (s: RootState): PatientData['allPatients'] | EventData['allEvents'] => {
  if (s.data.type === 'loading-complete') {
    return s.data.view === 'patients' ? s.data.patientData.allPatients : s.data.eventData.allEvents
  } else {
    return EMPTY_PATIENT_DATA.allPatients
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

const selectPatientFilters = (s: RootState): ReadonlyArray<GenericFilter> => {
  if (s.data.type === 'loading-complete') {
    const columns = s.data.patientData.columns
    return s.data.filters.filter((filter) => columns.findIndex((column) => column.name === filter.column.name) !== -1)
  } else {
    return []
  }
}

const selectEventFilters = (s: RootState): ReadonlyArray<GenericFilter> => {
  if (s.data.type === 'loading-complete') {
    const columns = s.data.eventData.columns
    return s.data.filters.filter((filter) => columns.findIndex((column) => column.name === filter.column.name) !== -1)
  } else {
    return []
  }
}

export const selectAllFilters = (s: RootState): ReadonlyArray<GenericFilter> => {
  if (s.data.type === 'loading-complete') {
    return s.data.filters
  } else {
    return []
  }
}

const selectFilteredPatientData = createSelector(
  selectPatientDataRows,
  selectPatientFilters,
  (patientDataRows, filters) => filters.reduce(filterReducer, patientDataRows)
)

const selectFilteredEventData = createSelector(selectEventDataRows, selectEventFilters, (eventDataRows, filters) =>
  filters.reduce<any>(filterReducer, eventDataRows)
)

// Using Set's is more performant for cross-filter computation
const selectFilteredPatientsPIDs = createSelector(
  selectFilteredPatientData,
  (filteredPatientData) => new Set(filteredPatientData.map((patient) => patient.pid))
)

// Using Set's is more performant for cross-filter computation
const selectFilteredEventsPIDs = createSelector(
  selectFilteredEventData,
  (filteredEventData) => new Set((filteredEventData as PatientJourneyEvent[]).map((event) => event.pid))
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
    (filteredEventData as PatientJourneyEvent[]).filter((event) => filteredPatientPIDSet.has(event.pid))
)

export const selectFilteredActiveData = createSelector(
  selectCrossFilteredPatientData,
  selectCrossFilteredEventData,
  selectDataView,
  (crossFilteredPatientData, crossFilteredEventData, view) =>
    // Filters applied to patients, to influence events as well (and vice versa)
    view === 'patients' ? crossFilteredPatientData : crossFilteredEventData
)
