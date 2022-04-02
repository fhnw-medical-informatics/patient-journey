import { setSorting } from './tableSlice'
import { createStoreWithMockData } from '../test/createStoreWithMockData'
import { ColumnSortingState } from '../data/sorting'

describe('tableSlice', () => {
  it(`handles ${setSorting.type} action`, async () => {
    const { store, loadedData } = await createStoreWithMockData()

    const ascByFirstPatientColumn: ColumnSortingState = {
      type: 'asc',
      column: loadedData.patientData.columns[0],
    }
    store.dispatch(
      setSorting({
        view: 'patients',
        sorting: ascByFirstPatientColumn,
      })
    )
    expect(store.getState().table['patients'].sorting).toEqual(ascByFirstPatientColumn)

    const descByFirstEventColumn: ColumnSortingState = {
      type: 'desc',
      column: loadedData.eventData.columns[0],
    }
    store.dispatch(
      setSorting({
        view: 'events',
        sorting: descByFirstEventColumn,
      })
    )
    expect(store.getState().table['events'].sorting).toEqual(descByFirstEventColumn)
  })
})
