import {
  DataStateLoadingComplete,
  DataStateLoadingFailed,
  loadData,
  setHoveredPatient,
  setSelectedPatient,
} from './dataSlice'
import { createStore } from '../store'
import { PatientId, PatientIdNone } from './patients'

const ID_1 = 'Id_1' as PatientId
const MOCK_PATIENT_CSV = 'Col_1,Id,Col_2\nstring,PiD,string\nCell_11,Id_1,Cell_12\n\nCell_21,Id_2,Cell_22'
const MOCK_EVENT_CSV = 'Event ID,Patient ID,Timestamp\neid,pid,timestamp\nEID_1,PID_1,1\nEID_2,PID_2,2'

describe('dataSlice', () => {
  const successPatientDataUrl = 'success-patient-data-url'
  const successEventDataUrl = 'success-event-data-url'
  const successUrlEmpty = 'success-url-empty'
  const errorUrl = 'error-url'
  const globalAny = global as any

  beforeEach(() => {
    globalAny.fetch = (url: string) => {
      switch (url) {
        case `${successPatientDataUrl}`:
          return Promise.resolve({
            text: () => Promise.resolve(MOCK_PATIENT_CSV),
          })
        case `${successEventDataUrl}`:
          return Promise.resolve({
            text: () => Promise.resolve(MOCK_EVENT_CSV),
          })
        case `${successUrlEmpty}`:
          return Promise.resolve({
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

    const data = store.getState().data
    expect(data.type).toEqual('loading-complete')

    // patients
    const patientData = (data as DataStateLoadingComplete).patientData
    expect(patientData.allPatients.length).toEqual(2)
    expect(patientData.columns).toEqual([
      { index: 0, name: 'Col_1', type: 'string' },
      { index: 1, name: 'Id', type: 'pid' },
      { index: 2, name: 'Col_2', type: 'string' },
    ])
    expect(patientData.allPatients[0].pid).toEqual('Id_1')
    expect(patientData.allPatients[1].pid).toEqual('Id_2')

    // events
    const eventData = (data as DataStateLoadingComplete).eventData
    expect(eventData.allEvents.length).toEqual(2)
    expect(eventData.columns).toEqual([
      { index: 0, name: 'Event ID', type: 'eid' },
      { index: 1, name: 'Patient ID', type: 'pid' },
      { index: 2, name: 'Timestamp', type: 'timestamp' },
    ])
    expect(eventData.allEvents[0].eid).toEqual('EID_1')
    expect(eventData.allEvents[0].pid).toEqual('PID_1')
    expect(eventData.allEvents[1].eid).toEqual('EID_2')
    expect(eventData.allEvents[1].pid).toEqual('PID_2')
  })

  it('loadData loading-complete empty data', async () => {
    const store = createStore()
    await loadData(successUrlEmpty, successUrlEmpty)(store.dispatch)

    const data = store.getState().data
    expect(data.type).toEqual('loading-complete')
    const patientData = (data as DataStateLoadingComplete).patientData
    expect(patientData.allPatients).toEqual([])
    expect(patientData.columns).toEqual([])
    const eventData = (data as DataStateLoadingComplete).eventData
    expect(eventData.allEvents).toEqual([])
    expect(eventData.columns).toEqual([])
  })

  it('loadData loading-failed', async () => {
    console.error = () => {}
    const store = createStore()
    await loadData(errorUrl)(store.dispatch)
    const data = store.getState().data
    expect(data.type).toEqual('loading-failed')
    expect((data as DataStateLoadingFailed).errorMessage).toEqual('Error fetching data')
  })

  it(`handles ${setSelectedPatient.type} action`, async () => {
    const store = createStore()
    await loadData(successPatientDataUrl, successEventDataUrl)(store.dispatch)
    const getSelected = () => (store.getState().data as DataStateLoadingComplete).patientData.selectedPatient
    expect(getSelected()).toEqual(PatientIdNone)
    store.dispatch(setSelectedPatient(ID_1))
    expect(getSelected()).toEqual(ID_1)
    store.dispatch(setSelectedPatient(PatientIdNone))
    expect(getSelected()).toEqual(PatientIdNone)
  })

  it(`handles ${setHoveredPatient.type} action`, async () => {
    const store = createStore()
    await loadData(successPatientDataUrl, successUrlEmpty)(store.dispatch)
    const getHovered = () => (store.getState().data as DataStateLoadingComplete).patientData.hoveredPatient
    expect(getHovered()).toEqual(PatientIdNone)
    store.dispatch(setHoveredPatient(ID_1))
    expect(getHovered()).toEqual(ID_1)
    store.dispatch(setHoveredPatient(PatientIdNone))
    expect(getHovered()).toEqual(PatientIdNone)
  })
})
