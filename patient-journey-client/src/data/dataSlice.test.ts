import {
  DataStateLoadingComplete,
  DataStateLoadingFailed,
  loadData,
  setHoveredEntity,
  setSelectedEntity,
  addDataFilter,
  removeDataFilter,
  resetDataFilter,
  setDataView,
  ActiveDataViewType,
} from './dataSlice'
import { createStore } from '../store'
import { PatientId, PatientIdNone } from './patients'
import { Filter } from './filtering'

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
    expect(patientData.allEntities.length).toEqual(2)
    expect(patientData.columns).toEqual([
      { index: 0, name: 'Col_1', type: 'string' },
      { index: 1, name: 'Id', type: 'pid' },
      { index: 2, name: 'Col_2', type: 'string' },
    ])
    expect(patientData.allEntities[0].pid).toEqual('Id_1')
    expect(patientData.allEntities[1].pid).toEqual('Id_2')

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
    expect((data as DataStateLoadingFailed).errorMessage).toEqual('Error fetching data')
  })

  it(`handles ${setSelectedEntity.type} action`, async () => {
    const store = createStore()
    await loadData(successPatientDataUrl, successEventDataUrl)(store.dispatch)
    const getSelected = () => (store.getState().data as DataStateLoadingComplete).patientData.selectedEntity
    expect(getSelected()).toEqual(PatientIdNone)
    store.dispatch(setSelectedEntity(ID_1))
    expect(getSelected()).toEqual(ID_1)
    store.dispatch(setSelectedEntity(PatientIdNone))
    expect(getSelected()).toEqual(PatientIdNone)
  })

  it(`handles ${setHoveredEntity.type} action`, async () => {
    const store = createStore()
    await loadData(successPatientDataUrl, successUrlEmpty)(store.dispatch)
    const getHovered = () => (store.getState().data as DataStateLoadingComplete).patientData.hoveredEntity
    expect(getHovered()).toEqual(PatientIdNone)
    store.dispatch(setHoveredEntity(ID_1))
    expect(getHovered()).toEqual(ID_1)
    store.dispatch(setHoveredEntity(PatientIdNone))
    expect(getHovered()).toEqual(PatientIdNone)
  })

  it(`handles ${addDataFilter.type} action`, async () => {
    const store = createStore()
    await loadData(successPatientDataUrl, successUrlEmpty)(store.dispatch)
    const getFilters = () => (store.getState().data as DataStateLoadingComplete).filters
    expect(getFilters()).toEqual([])

    const testFilter: Filter<'string'> = {
      column: { index: 0, name: 'Col_1', type: 'string' },
      type: 'string',
      value: {
        text: 'test',
      },
    }

    store.dispatch(addDataFilter(testFilter))
    expect(getFilters()).toEqual([testFilter])

    const testFilter2: Filter<'number'> = {
      column: { index: 0, name: 'Col_2', type: 'number' },
      type: 'number',
      value: {
        from: 1,
        to: 2,
      },
    }

    store.dispatch(addDataFilter(testFilter2))
    expect(getFilters()).toEqual([testFilter, testFilter2])
  })

  it(`handles ${removeDataFilter.type} action`, async () => {
    const store = createStore()
    await loadData(successPatientDataUrl, successUrlEmpty)(store.dispatch)
    const getFilters = () => (store.getState().data as DataStateLoadingComplete).filters
    expect(getFilters()).toEqual([])

    const testFilter: Filter<'string'> = {
      column: { index: 0, name: 'Col_1', type: 'string' },
      type: 'string',
      value: {
        text: 'test',
      },
    }

    store.dispatch(addDataFilter(testFilter))
    expect(getFilters()).toEqual([testFilter])

    const testFilter2: Filter<'number'> = {
      column: { index: 0, name: 'Col_2', type: 'number' },
      type: 'number',
      value: {
        from: 1,
        to: 2,
      },
    }

    store.dispatch(addDataFilter(testFilter2))
    expect(getFilters()).toEqual([testFilter, testFilter2])

    store.dispatch(removeDataFilter(testFilter))
    expect(getFilters()).toEqual([testFilter2])
  })

  it(`handles ${resetDataFilter.type} action`, async () => {
    const store = createStore()
    await loadData(successPatientDataUrl, successUrlEmpty)(store.dispatch)
    const getFilters = () => (store.getState().data as DataStateLoadingComplete).filters
    expect(getFilters()).toEqual([])

    const testFilter: Filter<'string'> = {
      column: { index: 0, name: 'Col_1', type: 'string' },
      type: 'string',
      value: {
        text: 'test',
      },
    }

    store.dispatch(addDataFilter(testFilter))
    expect(getFilters()).toEqual([testFilter])

    store.dispatch(resetDataFilter())
    expect(getFilters()).toEqual([])
  })

  it(`handles ${setDataView.type} action`, async () => {
    const store = createStore()
    await loadData(successPatientDataUrl, successUrlEmpty)(store.dispatch)
    const getView = () => (store.getState().data as DataStateLoadingComplete).view
    expect(getView()).toEqual('patients')
    store.dispatch(setDataView('events' as ActiveDataViewType))
    expect(getView()).toEqual('events')
  })
})
