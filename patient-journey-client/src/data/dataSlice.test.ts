import { DataStateLoadingComplete, DataStateLoadingFailed, loadData } from './dataSlice'
import { createStore } from '../store'

const globalAny = global as any

describe('dataSlice', () => {
  const successUrl = 'success-url'
  const errorUrl = 'error-url'

  beforeEach(() => {
    globalAny.fetch = (url: string) => {
      switch (url) {
        case `${successUrl}`:
          return Promise.resolve({
            text: () => Promise.resolve('Col_1,Col_2\nCell_11,Cell_12\n\nCell_21,Cell_22'),
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

    const patients = (data as DataStateLoadingComplete).patients
    expect(patients.rows.length).toEqual(2)
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
