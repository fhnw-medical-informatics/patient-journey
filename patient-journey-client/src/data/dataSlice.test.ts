import {
  ActiveDataViewType,
  addDataFilter,
  DataStateLoadingFailed,
  loadData,
  loadingDataInProgress,
  removeDataFilter,
  resetDataFilter,
  resetIndexPatient,
  setDataView,
  setHoveredEntity,
  setIndexPatient,
  setSelectedEntity,
} from './dataSlice'

import { createStore } from '../store'

import { Filter } from './filtering'
import { Patient, PatientId, PatientIdNone } from './patients'
import { EventId, PatientJourneyEvent } from './events'
import { DATA_LOADING_ERROR, LoadingStep } from './loading'
import { createStoreWithMockData } from '../test/createStoreWithMockData'
import {
  selectActiveHoveredEventEntity,
  selectActiveSelectedEntity,
  selectAllFilters,
  selectData,
  selectDataLoadingProgress,
  selectDataView,
  selectIndexPatientId,
} from './selectors'
import { EntityIdNone } from './entities'

const PID_1 = 'PID_1' as PatientId
const PID_2 = 'PID_2' as PatientId

const TEST_PATIENTS_CSV = 'Col_1,Id,Col_2\nstring,PiD,string\nCell_11,PID_1,Cell_12\n\nCell_21,PID_2,Cell_22'
const TEST_PATIENTS_CSV_MISSING_PID = 'Name\nstring\nJane'
const TEST_PATIENTS_CSV_INVALID_COLUMN_TYPE = 'ID,Name,Invalid\npid,string,invalid\nPID_1,Jane,X\nPID_2,John,Y'
const TEST_PATIENTS_CSV_HEADERS_ONLY = 'Col_1,Id,Col_2\nstring,PiD,string'
const TEST_EVENTS_CSV = 'Event ID,Patient ID,Timestamp\neid,pid,timestamp\nEID_1,PID_1,1\nEID_2,PID_2,2'
const TEST_EVENTS_CSV_MISSING_PID = 'Event ID,Timestamp\neid,timestamp\nEID_1,1\nEID_2,2'
const TEST_EVENTS_CSV_MISSING_EID = 'Patient ID,Timestamp\npid,timestamp\nPID_1,42'
const TEST_EVENTS_CSV_INVALID_COLUMN_TYPE = 'Event ID,Patient ID,Invalid\neid,pid,invalid\nEID_1,PID_1,1\nEID_2,PID_2,2'
const TEST_EVENTS_CSV_HEADERS_ONLY = 'Event ID,Patient ID,Timestamp\neid,pid,timestamp'
const TEST_SIMILARITIES_CSV = '↓ Other Patient | Index Patient →,PID_1,PID_2\nPID_1,1,42\nPID_2,99,1'

describe('dataSlice', () => {
  const patientDataUrl = 'patientDataUrl'
  const patientDataUrlMissingPid = 'patientDataUrlMissingPid'
  const patientDataUrlInvalidColumnType = 'patientUrlDataInvalidColumnType'
  const patientDataUrlHeadersOnly = 'patientDataUrlHeadersOnly'

  const eventDataUrl = 'eventDataUrl'
  const eventDataUrlMissingEid = 'eventDataUrlMissingEid'
  const eventDataUrlInvalidColumnType = 'eventDataUrlInvalidColumnType'
  const eventDataUrlHeadersOnly = 'eventDataUrlHeadersOnly'
  const successEventDataUrlMissingPid = 'successEventDataUrlMissingPid'

  const similarityDataUrl = 'similarityDataUrl'

  const emptyUrl = 'emptyUrl'
  const errorUrl = 'errorUrl'

  const globalAny = global as any

  beforeEach(() => {
    globalAny.fetch = (url: string) => {
      switch (url) {
        case `${patientDataUrl}`:
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(TEST_PATIENTS_CSV),
          })
        case `${patientDataUrlMissingPid}`:
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(TEST_PATIENTS_CSV_MISSING_PID),
          })
        case `${patientDataUrlInvalidColumnType}`:
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(TEST_PATIENTS_CSV_INVALID_COLUMN_TYPE),
          })
        case `${patientDataUrlHeadersOnly}`:
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(TEST_PATIENTS_CSV_HEADERS_ONLY),
          })
        case `${eventDataUrl}`:
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(TEST_EVENTS_CSV),
          })
        case `${eventDataUrlMissingEid}`:
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(TEST_EVENTS_CSV_MISSING_EID),
          })
        case `${eventDataUrlInvalidColumnType}`:
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(TEST_EVENTS_CSV_INVALID_COLUMN_TYPE),
          })
        case `${eventDataUrlHeadersOnly}`:
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(TEST_EVENTS_CSV_HEADERS_ONLY),
          })
        case `${successEventDataUrlMissingPid}`:
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(TEST_EVENTS_CSV_MISSING_PID),
          })
        case `${similarityDataUrl}`:
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(TEST_SIMILARITIES_CSV),
          })
        case `${emptyUrl}`:
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
    await loadData(false, patientDataUrl, eventDataUrl, similarityDataUrl)(store.dispatch, store.getState)

    expect(store.getState().alert.alerts).toEqual([])
    const data = selectData(store.getState())
    expect(data.type).toEqual('loading-complete')

    // patients
    const patientData = data.patientData
    expect(patientData.allEntities.length).toEqual(2)
    expect(patientData.columns).toEqual([
      { index: 0, name: 'Col_1', type: 'string' },
      { index: 1, name: 'Id', type: 'pid' },
      { index: 2, name: 'Col_2', type: 'string' },
    ])
    expect(patientData.allEntities[0].pid).toEqual('PID_1')
    expect(patientData.allEntities[1].pid).toEqual('PID_2')

    // events
    const eventData = data.eventData
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

    // similarities
    const similarityData = data.similarityData
    expect(similarityData).toEqual({
      PID_1: {
        indexPatient: PID_1,
        PID_1: '1',
        PID_2: '99',
      },
      PID_2: {
        indexPatient: PID_2,
        PID_1: '42',
        PID_2: '1',
      },
    })
  })

  it('loadData loading-complete patient data table missing pid', async () => {
    const store = createStore()
    await loadData(false, patientDataUrlMissingPid, eventDataUrl, similarityDataUrl)(store.dispatch, store.getState)

    const state = store.getState()
    const patientData = selectData(state).patientData
    const expectedPatient: Patient = {
      pid: '0' as PatientId,
      uid: '0' as PatientId,
      values: ['Jane'],
    }
    expect(patientData.allEntities[0]).toEqual(expectedPatient)
    expect(state.alert.alerts.length).toBeGreaterThan(1)
    expect(state.alert.alerts[0].message).toEqual(
      "No 'pid' column type found in patient data table. Using row index to identify patients."
    )
  })

  it('loadData loading-complete patient data table invalid column type', async () => {
    const store = createStore()
    await loadData(
      false,
      patientDataUrlInvalidColumnType,
      eventDataUrl,
      similarityDataUrl
    )(store.dispatch, store.getState)
    expect(store.getState().alert.alerts.length).toEqual(1)
    expect(store.getState().alert.alerts[0].message).toEqual(
      "Invalid column type 'invalid' found in patient data table. Falling back to 'string'."
    )
  })

  it('loadData loading-complete event data table missing eid', async () => {
    const store = createStore()
    await loadData(false, patientDataUrl, eventDataUrlMissingEid, similarityDataUrl)(store.dispatch, store.getState)

    const state = store.getState()
    const eventData = selectData(state).eventData
    const expectedEvent: PatientJourneyEvent = {
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

  it('loadData loading-complete event data table invalid column type', async () => {
    const store = createStore()
    await loadData(
      false,
      patientDataUrl,
      eventDataUrlInvalidColumnType,
      similarityDataUrl
    )(store.dispatch, store.getState)
    expect(store.getState().alert.alerts.length).toEqual(1)
    expect(store.getState().alert.alerts[0].message).toEqual(
      "Invalid column type 'invalid' found in event data table. Falling back to 'string'."
    )
  })

  it('loadData loading-failed', async () => {
    console.error = () => {}
    const store = createStore()
    await loadData(false, errorUrl)(store.dispatch, store.getState)
    const data = store.getState().data
    expect(data.type).toEqual('loading-failed')
    expect((data as DataStateLoadingFailed).errorMessage).toEqual(DATA_LOADING_ERROR)
  })

  it('loadData loading-failed patient table missing header rows', async () => {
    const store = createStore()
    await loadData(false, emptyUrl, emptyUrl)(store.dispatch, store.getState)

    const state = store.getState()
    const data = state.data
    expect(data.type).toEqual('loading-failed')
    expect(state.alert.alerts.length).toEqual(1)
    expect(state.alert.alerts[0].message).toEqual(
      'Patient data table must contain two header rows (column names, column types).'
    )
  })

  it('loadData loading-failed event missing header rows', async () => {
    const store = createStore()
    await loadData(false, patientDataUrl, emptyUrl)(store.dispatch, store.getState)

    const state = store.getState()
    const data = state.data
    expect(data.type).toEqual('loading-failed')
    expect(state.alert.alerts.length).toEqual(1)
    expect(state.alert.alerts[0].message).toEqual(
      'Event data table must contain two header rows (column names, column types).'
    )
  })

  it('loadData loading-failed patient table no data rows', async () => {
    const store = createStore()
    await loadData(false, patientDataUrlHeadersOnly, emptyUrl)(store.dispatch, store.getState)
    const data = store.getState().data
    expect(data.type).toEqual('loading-failed')
    expect((data as DataStateLoadingFailed).errorMessage).toEqual(DATA_LOADING_ERROR)
    expect(store.getState().alert.alerts.length).toEqual(1)
    expect(store.getState().alert.alerts[0].message).toEqual(
      'Patient data table must contain at least one row of data.'
    )
  })

  it('loadData loading-failed event table no data rows', async () => {
    const store = createStore()
    await loadData(false, patientDataUrl, eventDataUrlHeadersOnly)(store.dispatch, store.getState)
    const data = store.getState().data
    expect(data.type).toEqual('loading-failed')
    expect((data as DataStateLoadingFailed).errorMessage).toEqual(DATA_LOADING_ERROR)
    expect(store.getState().alert.alerts.length).toEqual(1)
    expect(store.getState().alert.alerts[0].message).toEqual('Event data table must contain at least one row of data.')
  })

  it('loadData loading-failed event table missing pid column type', async () => {
    const store = createStore()
    await loadData(false, patientDataUrl, successEventDataUrlMissingPid)(store.dispatch, store.getState)
    const data = store.getState().data
    expect(data.type).toEqual('loading-failed')
    expect((data as DataStateLoadingFailed).errorMessage).toEqual(DATA_LOADING_ERROR)
    expect(store.getState().alert.alerts.length).toEqual(1)
    expect(store.getState().alert.alerts[0].message).toEqual("No 'pid' column type found in event data table.")
  })

  it(`handles ${loadingDataInProgress.type} action`, async () => {
    const store = createStore()
    store.dispatch(loadingDataInProgress({ activeStep: LoadingStep.Events }))
    const data = selectDataLoadingProgress(store.getState())
    expect(data.activeStep).toEqual(LoadingStep.Events)
  })

  it(`handles ${setSelectedEntity.type} action`, async () => {
    const { store } = await createStoreWithMockData()
    const getSelected = () => selectActiveSelectedEntity(store.getState())
    expect(getSelected()).toEqual(PatientIdNone)
    store.dispatch(setSelectedEntity({ uid: PID_1, type: 'patients' }))
    expect(getSelected()).toEqual(PID_1)
    store.dispatch(setSelectedEntity(PatientIdNone))
    expect(getSelected()).toEqual(PatientIdNone)
  })

  it(`sets the selected entity uid to ${EntityIdNone} when the same entity gets set again`, async () => {
    const { store } = await createStoreWithMockData()
    const getSelected = () => selectActiveSelectedEntity(store.getState())
    expect(getSelected()).toEqual(EntityIdNone)
    store.dispatch(setSelectedEntity({ uid: PID_1, type: 'patients' }))
    expect(getSelected()).toEqual(PID_1)
    store.dispatch(setSelectedEntity({ uid: PID_1, type: 'patients' }))
    expect(getSelected()).toEqual(EntityIdNone)
  })

  it(`handles ${setHoveredEntity.type} action`, async () => {
    const { store } = await createStoreWithMockData()
    const getHovered = () => selectActiveHoveredEventEntity(store.getState())
    expect(getHovered()).toEqual(PatientIdNone)
    store.dispatch(setHoveredEntity({ uid: PID_1, type: 'events' }))
    expect(getHovered()).toEqual(PID_1)
    store.dispatch(setHoveredEntity(PatientIdNone))
    expect(getHovered()).toEqual(PatientIdNone)
  })

  it(`handles ${addDataFilter.type} action`, async () => {
    const { store } = await createStoreWithMockData()
    const getFilters = () => selectAllFilters(store.getState())
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
        toInclusive: true,
      },
    }

    store.dispatch(addDataFilter(testFilter2))
    expect(getFilters()).toEqual([testFilter, testFilter2])
  })

  it(`does not add the same filter twice with ${addDataFilter.type} action`, async () => {
    const { store } = await createStoreWithMockData()
    const getFilters = () => selectAllFilters(store.getState())
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

    store.dispatch(addDataFilter(testFilter))
    expect(getFilters()).toEqual([testFilter])
  })

  it(`does not add the same filter twice with ${addDataFilter.type} action, if the filter value is different, it updates the value`, async () => {
    const { store } = await createStoreWithMockData()
    const getFilters = () => selectAllFilters(store.getState())
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

    const testFilter2: Filter<'string'> = {
      column: { index: 0, name: 'Col_1', type: 'string' },
      type: 'string',
      value: {
        text: 'test2',
      },
    }

    store.dispatch(addDataFilter(testFilter2))
    expect(getFilters()).toEqual([testFilter2])
  })

  it(`handles ${removeDataFilter.type} action`, async () => {
    const { store } = await createStoreWithMockData()
    const getFilters = () => selectAllFilters(store.getState())
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
        toInclusive: true,
      },
    }

    store.dispatch(addDataFilter(testFilter2))
    expect(getFilters()).toEqual([testFilter, testFilter2])

    store.dispatch(removeDataFilter(testFilter))
    expect(getFilters()).toEqual([testFilter2])
  })

  it(`handles ${resetDataFilter.type} action`, async () => {
    const { store } = await createStoreWithMockData()
    const getFilters = () => selectAllFilters(store.getState())
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
    const { store } = await createStoreWithMockData()
    const getView = () => selectDataView(store.getState())
    expect(getView()).toEqual('patients')
    store.dispatch(setDataView('events' as ActiveDataViewType))
    expect(getView()).toEqual('events')
  })

  it(`handles ${setIndexPatient.type} action`, async () => {
    const { store } = await createStoreWithMockData()
    const getIndexPatientId = () => selectIndexPatientId(store.getState())
    expect(getIndexPatientId()).toEqual(PatientIdNone)
    store.dispatch(setIndexPatient('PID_1'))
    expect(getIndexPatientId()).toEqual('PID_1')
    store.dispatch(setIndexPatient(PatientIdNone))
    expect(getIndexPatientId()).toEqual(PatientIdNone)
  })

  it(`handles ${resetIndexPatient.type} action`, async () => {
    const { store } = await createStoreWithMockData()
    const getIndexPatientId = () => selectIndexPatientId(store.getState())
    expect(getIndexPatientId()).toEqual(PatientIdNone)
    store.dispatch(setIndexPatient('PID_1'))
    expect(getIndexPatientId()).toEqual('PID_1')
    store.dispatch(resetIndexPatient())
    expect(getIndexPatientId()).toEqual(PatientIdNone)
  })

  it(`removes the filter on the Similarity column when resetting the index patient`, async () => {
    const { store } = await createStoreWithMockData()
    const getFilters = () => selectAllFilters(store.getState())
    expect(getFilters()).toEqual([])

    const testFilter: Filter<'number'> = {
      column: { index: 0, name: 'Similarity', type: 'number' },
      type: 'number',
      value: {
        from: 0,
        to: 0.5,
        toInclusive: true,
      },
    }

    const testFilter2: Filter<'string'> = {
      column: { index: 1, name: 'Col_1', type: 'string' },
      type: 'string',
      value: {
        text: 'test',
      },
    }

    store.dispatch(addDataFilter(testFilter))
    store.dispatch(addDataFilter(testFilter2))

    expect(getFilters()).toEqual([testFilter, testFilter2])
    store.dispatch(resetIndexPatient())
    expect(getFilters()).toEqual([testFilter2])
  })
})
