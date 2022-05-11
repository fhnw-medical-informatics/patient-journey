import { setSorting } from './tableSlice'
import { createStoreWithMockData } from '../test/createStoreWithMockData'
import { ColumnSortingState } from '../data/sorting'
import { resetIndexPatient } from '../data/dataSlice'

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

  it(`resets sorting when resetIndexPatient action is dispatched and active sorting column is Similarity`, async () => {
    const { store } = await createStoreWithMockData()

    const getPatientsSorting = () => store.getState().table.patients.sorting

    const SIMILARITY_SORTING: ColumnSortingState = {
      type: 'asc',
      column: {
        name: 'Similarity',
        type: 'number',
        index: 1,
      },
    }

    store.dispatch(
      setSorting({
        view: 'patients',
        sorting: SIMILARITY_SORTING,
      })
    )
    expect(getPatientsSorting()).toEqual(SIMILARITY_SORTING)
    store.dispatch(resetIndexPatient())
    expect(getPatientsSorting()).toEqual({ type: 'neutral' })

    const NON_SIMILARITY_SORTING: ColumnSortingState = {
      type: 'asc',
      column: {
        name: 'First Name',
        type: 'string',
        index: 0,
      },
    }

    store.dispatch(
      setSorting({
        view: 'patients',
        sorting: NON_SIMILARITY_SORTING,
      })
    )
    expect(getPatientsSorting()).toEqual(NON_SIMILARITY_SORTING)
    store.dispatch(resetIndexPatient())
    expect(getPatientsSorting()).toEqual(NON_SIMILARITY_SORTING)
  })
})
