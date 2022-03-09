import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store'
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

export const selectSelectedPatient = (s: RootState): PatientId => selectPatientData(s).selectedPatient
export const selectHoveredPatient = (s: RootState): PatientId => selectPatientData(s).hoveredPatient

export const selectFilters = (s: RootState): ReadonlyArray<GenericFilter> => {
  if (s.data.type === 'loading-complete') {
    return s.data.filters
  } else {
    return []
  }
}

export const selectFilteredPatientData = createSelector(selectPatientData, selectFilters, (patientData, filters) =>
  filters.reduce(filterReducer, patientData)
)

export const selectFilteredEventData = createSelector(selectEventData, selectFilters, (eventData, filters) =>
  filters.reduce(filterReducer, eventData)
)
