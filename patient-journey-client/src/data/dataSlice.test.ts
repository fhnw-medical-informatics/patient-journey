import {
  DataStateLoadingComplete,
  DataStateLoadingFailed,
  loadData,
  PatientId,
  PatientIdNone,
  setSelectedPatient,
} from './dataSlice'
import { createStore } from '../store'

const ID_1 = 'Id_1' as PatientId

const globalAny = global as any

describe('dataSlice', () => {
  const successUrl = 'success-url'
  const successUrlEmpty = 'success-url-empty'
  const errorUrl = 'error-url'

  beforeEach(() => {
    globalAny.fetch = (url: string) => {
      switch (url) {
        case `${successUrl}`:
          return Promise.resolve({
            text: () => Promise.resolve('Id,Col_1,Col_2\nId_1,Cell_11,Cell_12\n\nId_2,Cell_21,Cell_22'),
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
    expect(patientData.fields).toEqual(['Id', 'Col_1', 'Col_2'])
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
    expect(patientData.fields).toEqual([])
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
    store.dispatch(setSelectedPatient({ id: ID_1 }))
    expect(getSelected()).toEqual(ID_1)
    store.dispatch(setSelectedPatient({ id: PatientIdNone }))
    expect(getSelected()).toEqual(PatientIdNone)
  })
})
