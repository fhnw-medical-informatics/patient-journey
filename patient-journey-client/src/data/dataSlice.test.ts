import {
  DataStateLoadingComplete,
  DataStateLoadingFailed,
  loadData,
  setHoveredEntity,
  setSelectedEntity,
} from './dataSlice'
import { createStore } from '../store'
import { Patient, PatientId, PatientIdNone } from './patients'
import { EventId, PatientJourneyEvent } from './events'
import { DATA_LOADING_ERROR } from './loading'

const PID_1 = 'PID_1' as PatientId
const TEST_PATIENT_CSV = 'Col_1,Id,Col_2\nstring,PiD,string\nCell_11,PID_1,Cell_12\n\nCell_21,PID_2,Cell_22'
const TEST_PATIENT_CSV_MISSING_PID = 'Name\nstring\nJane'
const TEST_EVENT_CSV = 'Event ID,Patient ID,Timestamp\neid,pid,timestamp\nEID_1,PID_1,1\nEID_2,PID_2,2'
const TEST_EVENT_CSV_MISSING_EID = 'Patient ID,Timestamp\npid,timestamp\nPID_1,42'

describe('dataSlice', () => {
  const successPatientDataUrl = 'success-patient-data-url'
  const successPatientDataUrlMissingPid = 'successPatientDataUrlMissingPid'
  const successEventDataUrlMissingEid = 'successEventDataUrlMissingEid'
  const successEventDataUrl = 'success-event-data-url'
  const successUrlEmpty = 'success-url-empty'
  const errorUrl = 'error-url'
  const globalAny = global as any

  beforeEach(() => {
    globalAny.fetch = (url: string) => {
      switch (url) {
        case `${successPatientDataUrl}`:
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(TEST_PATIENT_CSV),
          })
        case `${successPatientDataUrlMissingPid}`:
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(TEST_PATIENT_CSV_MISSING_PID),
          })
        case `${successEventDataUrl}`:
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(TEST_EVENT_CSV),
          })
        case `${successEventDataUrlMissingEid}`:
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(TEST_EVENT_CSV_MISSING_EID),
          })
        case `${successUrlEmpty}`:
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(''),
          })
        case `${errorUrl}`:
          throw new Error('Boom!')
        default:
          return Promise.reject('Unexpected fetch call (no mock implementation)')
      }
    }
  })

  it('loadData loading-complete', async () => {
    const store = createStore()
    await loadData(successPatientDataUrl, successEventDataUrl)(store.dispatch)

    expect(store.getState().alert.alerts).toEqual([])
    const data = store.getState().data
    expect(data.type).toEqual('loading-complete')

    // patients
    const patientData = (data as DataStateLoadingComplete).patientData
    expect(patientData.allEntities.length).toEqual(2)
    expect(patientData.columns).toEqual([
      { index: 0, name: 'Col_1', type: 'string' },
      { index: 1, name: 'Id', type: 'pid' },
      { index: 2, name: 'Col_2', type: 'string' },
    ])
    expect(patientData.allEntities[0].pid).toEqual('PID_1')
    expect(patientData.allEntities[1].pid).toEqual('PID_2')

    // events
    const eventData = (data as DataStateLoadingComplete).eventData
    expect(eventData.allEntities.length).toEqual(2)
    expect(eventData.columns).toEqual([
      { index: 0, name: 'Event ID', type: 'eid' },
      { index: 1, name: 'Patient ID', type: 'pid' },
      { index: 2, name: 'Timestamp', type: 'timestamp' },
    ])
    expect(eventData.allEntities[0].eid).toEqual('EID_1')
    expect(eventData.allEntities[0].pid).toEqual('PID_1')
    expect(eventData.allEntities[1].eid).toEqual('EID_2')
    expect(eventData.allEntities[1].pid).toEqual('PID_2')
  })

  it('loadData loading-complete empty data', async () => {
    const store = createStore()
    await loadData(successUrlEmpty, successUrlEmpty)(store.dispatch)

    const data = store.getState().data
    expect(data.type).toEqual('loading-complete')
    const patientData = (data as DataStateLoadingComplete).patientData
    expect(patientData.allEntities).toEqual([])
    expect(patientData.columns).toEqual([])
    const eventData = (data as DataStateLoadingComplete).eventData
    expect(eventData.allEntities).toEqual([])
    expect(eventData.columns).toEqual([])
  })

  it('loadData loading-complete patients table missing pid', async () => {
    const store = createStore()
    await loadData(successPatientDataUrlMissingPid, successUrlEmpty)(store.dispatch)

    const state = store.getState()
    const data = state.data
    expect(data.type).toEqual('loading-complete')
    const patientData = (data as DataStateLoadingComplete).patientData
    const expectedPatient: Patient = {
      type: 'patients',
      pid: '0' as PatientId,
      uid: '0' as PatientId,
      values: ['Jane'],
    }
    expect(patientData.allEntities[0]).toEqual(expectedPatient)
    expect(state.alert.alerts.length).toEqual(1)
    expect(state.alert.alerts[0].message).toEqual(
      "No 'pid' column type found in patient data table. Using row index to identify patients."
    )
  })

  it('loadData loading-complete events table missing eid', async () => {
    const store = createStore()
    await loadData(successPatientDataUrl, successEventDataUrlMissingEid)(store.dispatch)

    const state = store.getState()
    const data = state.data
    expect(data.type).toEqual('loading-complete')
    const eventData = (data as DataStateLoadingComplete).eventData
    const expectedEvent: PatientJourneyEvent = {
      type: 'events',
      eid: '0' as EventId,
      uid: '0' as EventId,
      pid: PID_1,
      values: [PID_1, '42'],
    }
    expect(eventData.allEntities[0]).toEqual(expectedEvent)
    expect(state.alert.alerts.length).toEqual(1)
    expect(state.alert.alerts[0].message).toEqual(
      "No 'eid' column type found in event data table. Using row index to identify events."
    )
  })

  it('loadData loading-failed', async () => {
    console.error = () => {}
    const store = createStore()
    await loadData(errorUrl)(store.dispatch)
    const data = store.getState().data
    expect(data.type).toEqual('loading-failed')
    expect((data as DataStateLoadingFailed).errorMessage).toEqual(DATA_LOADING_ERROR)
  })

  it(`handles ${setSelectedEntity.type} action`, async () => {
    const store = createStore()
    await loadData(successPatientDataUrl, successEventDataUrl)(store.dispatch)
    const getSelected = () => (store.getState().data as DataStateLoadingComplete).patientData.selectedEntity
    expect(getSelected()).toEqual(PatientIdNone)
    store.dispatch(setSelectedEntity(PID_1))
    expect(getSelected()).toEqual(PID_1)
    store.dispatch(setSelectedEntity(PatientIdNone))
    expect(getSelected()).toEqual(PatientIdNone)
  })

  it(`handles ${setHoveredEntity.type} action`, async () => {
    const store = createStore()
    await loadData(successPatientDataUrl, successUrlEmpty)(store.dispatch)
    const getHovered = () => (store.getState().data as DataStateLoadingComplete).patientData.hoveredEntity
    expect(getHovered()).toEqual(PatientIdNone)
    store.dispatch(setHoveredEntity(PID_1))
    expect(getHovered()).toEqual(PID_1)
    store.dispatch(setHoveredEntity(PatientIdNone))
    expect(getHovered()).toEqual(PatientIdNone)
  })
})
