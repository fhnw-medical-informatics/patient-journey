import {
  DataStateLoadingComplete,
  DataStateLoadingFailed,
  loadData,
  setHoveredEntity,
  setSelectedEntity,
} from './dataSlice'
import { createStore } from '../store'
import { PatientId, PatientIdNone } from './patients'
import { DATA_LOADING_ERROR } from './loading'

const PID_1 = 'PID_1' as PatientId
const MOCK_PATIENT_CSV = 'Col_1,Id,Col_2\nstring,PiD,string\nCell_11,PID_1,Cell_12\n\nCell_21,PID_2,Cell_22'
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
            ok: true,
            text: () => Promise.resolve(MOCK_PATIENT_CSV),
          })
        case `${successEventDataUrl}`:
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(MOCK_EVENT_CSV),
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
