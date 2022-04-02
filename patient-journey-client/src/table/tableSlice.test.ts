import { setPage, setSorting } from './tableSlice'
import { createStoreWithMockData } from '../test/createStoreWithMockData'
import { ColumnSortingState } from '../data/sorting'

describe('tableSlice', () => {
  it(`handles ${setSorting.type} action`, async () => {
    const { store, loadedData } = await createStoreWithMockData()

    const eventsDefaultSorting = store.getState().table.events.sorting

    const ASC_BY_FIRST_PATIENT_COLUMN: ColumnSortingState = {
      type: 'asc',
      column: loadedData.patientData.columns[0],
    }

    const DESC_BY_FIRST_EVENT_COLUMN: ColumnSortingState = {
      type: 'desc',
      column: loadedData.eventData.columns[0],
    }

    store.dispatch(
      setSorting({
        view: 'patients',
        sorting: ASC_BY_FIRST_PATIENT_COLUMN,
      })
    )
    expect(store.getState().table['patients'].sorting).toEqual(ASC_BY_FIRST_PATIENT_COLUMN)
    expect(store.getState().table['events'].sorting).toEqual(eventsDefaultSorting)
    store.dispatch(
      setSorting({
        view: 'events',
        sorting: DESC_BY_FIRST_EVENT_COLUMN,
      })
    )
    expect(store.getState().table['patients'].sorting).toEqual(ASC_BY_FIRST_PATIENT_COLUMN)
    expect(store.getState().table['events'].sorting).toEqual(DESC_BY_FIRST_EVENT_COLUMN)
  })
  it(`handles ${setPage.type} action`, async () => {
    const { store } = await createStoreWithMockData()

    store.dispatch(
      setPage({
        view: 'patients',
        page: 99,
      })
    )

    expect(store.getState().table['patients'].page).toEqual(99)
    expect(store.getState().table['events'].page).toEqual(0)

    store.dispatch(
      setPage({
        view: 'events',
        page: 42,
      })
    )

    expect(store.getState().table['patients'].page).toEqual(99)
    expect(store.getState().table['events'].page).toEqual(42)
  })
})
