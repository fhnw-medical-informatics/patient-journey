import { DataStateLoadingComplete, DataStateLoadingFailed, loadData } from './dataSlice'
import { createStore } from '../store'

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
            text: () => Promise.resolve('Id,Col_1,Col_2\nId1,Cell_11,Cell_12\n\nId2,Cell_21,Cell_22'),
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

    const patients = (data as DataStateLoadingComplete).patientData
    expect(patients.rows.length).toEqual(2)
    expect(patients.fields).toEqual(['Id', 'Col_1', 'Col_2'])
    expect(patients.rows[0].id).toEqual('Id1')
    expect(patients.rows[1].id).toEqual('Id2')
  })

  it('loadData loading-complete empty data', async () => {
    const store = createStore()
    await loadData(successUrlEmpty)(store.dispatch)

    const data = store.getState().data
    expect(data.type).toEqual('loading-complete')
    const patients = (data as DataStateLoadingComplete).patientData
    expect(patients.rows).toEqual([])
    expect(patients.fields).toEqual([])
  })

  it('loadData loading-failed', async () => {
    console.error = () => {}
    const store = createStore()
    await loadData(errorUrl)(store.dispatch)
    const data = store.getState().data
    expect(data.type).toEqual('loading-failed')
    expect((data as DataStateLoadingFailed).errorMessage).toEqual('Error fetching data')
  })
})
