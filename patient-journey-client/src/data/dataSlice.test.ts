import {
  DataStateLoadingComplete,
  DataStateLoadingFailed,
  loadData,
  PatientId,
  PatientIdNone,
  setHoveredPatient,
  setSelectedPatient,
} from './dataSlice'
import { createStore } from '../store'

const ID_1 = 'Id_1' as PatientId
const MOCK_CSV = 'Col_1,Id,Col_2\nstring,iD,string\nCell_11,Id_1,Cell_12\n\nCell_21,Id_2,Cell_22'

describe('dataSlice', () => {
  const successUrl = 'success-url'
  const successUrlEmpty = 'success-url-empty'
  const errorUrl = 'error-url'
  const globalAny = global as any

  beforeEach(() => {
    globalAny.fetch = (url: string) => {
      switch (url) {
        case `${successUrl}`:
          return Promise.resolve({
            text: () => Promise.resolve(MOCK_CSV),
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
    await loadData(successUrl)(store.dispatch)

    const data = store.getState().data
    expect(data.type).toEqual('loading-complete')

    const patientData = (data as DataStateLoadingComplete).patientData
    expect(patientData.allPatients.length).toEqual(2)
    expect(patientData.columns).toEqual([
      { index: 0, name: 'Col_1', type: 'string' },
      { index: 1, name: 'Id', type: 'id' },
      { index: 2, name: 'Col_2', type: 'string' },
    ])
    expect(patientData.allPatients[0].id).toEqual('Id_1')
    expect(patientData.allPatients[1].id).toEqual('Id_2')
  })

  it('loadData loading-complete empty data', async () => {
    const store = createStore()
    await loadData(successUrlEmpty)(store.dispatch)

    const data = store.getState().data
    expect(data.type).toEqual('loading-complete')
    const patientData = (data as DataStateLoadingComplete).patientData
    expect(patientData.allPatients).toEqual([])
    expect(patientData.columns).toEqual([])
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
    await loadData(successUrl)(store.dispatch)
    const getSelected = () => (store.getState().data as DataStateLoadingComplete).patientData.selectedPatient
    expect(getSelected()).toEqual(PatientIdNone)
    store.dispatch(setSelectedPatient(ID_1))
    expect(getSelected()).toEqual(ID_1)
    store.dispatch(setSelectedPatient(PatientIdNone))
    expect(getSelected()).toEqual(PatientIdNone)
  })

  it(`handles ${setHoveredPatient.type} action`, async () => {
    const store = createStore()
    await loadData(successUrl)(store.dispatch)
    const getHovered = () => (store.getState().data as DataStateLoadingComplete).patientData.hoveredPatient
    expect(getHovered()).toEqual(PatientIdNone)
    store.dispatch(setHoveredPatient(ID_1))
    expect(getHovered()).toEqual(ID_1)
    store.dispatch(setHoveredPatient(PatientIdNone))
    expect(getHovered()).toEqual(PatientIdNone)
  })
})
